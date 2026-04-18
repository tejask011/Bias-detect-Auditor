from flask import Flask, request, jsonify
from bias import detect_bias_all_columns, most_biased_feature
import pandas as pd
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

app = Flask(__name__)

# ==============================
# 📊 DATA BIAS
# ==============================
def detect_data_bias(df):
    data_bias = {}

    for col in df.columns:
        if df[col].nunique() <= 10:
            value_counts = df[col].value_counts(normalize=True)

            data_bias[col] = {
                str(k): round(float(v), 3)
                for k, v in value_counts.items()
            }

    return data_bias


# ==============================
# 📊 AVG BIAS
# ==============================
def calculate_avg_bias(bias_report):
    if not bias_report:
        return 0
    scores = [v["bias_score"] for v in bias_report.values()]
    return round(sum(scores) / len(scores), 3)


# ==============================
# 🔥 FAIRNESS WEIGHTS
# ==============================
def compute_sample_weights(df, sensitive_col, y_true):
    df = df.copy()
    df["target"] = y_true

    group_counts = df[sensitive_col].value_counts(normalize=True)

    weights = []
    for _, row in df.iterrows():
        group = row[sensitive_col]
        weight = 1 / (group_counts[group] + 0.01)
        weights.append(weight)

    return weights


# ==============================
# 🧠 SUMMARY GENERATOR (NEW)
# ==============================
def generate_summary(bias_report, avg_before, avg_after):
    # overall bias level
    if avg_after > 0.6:
        overall = "High ⚠️"
    elif avg_after > 0.3:
        overall = "Moderate ⚠️"
    else:
        overall = "Low ✅"

    # mitigation impact
    if avg_after < avg_before:
        impact = "Effective ✅"
    else:
        impact = "Limited ⚠️"

    # strong features
    strong_features = []
    for feature, data in bias_report.items():
        if data["bias_score"] > 0.7:
            strong_features.append(feature)

    if strong_features:
        reason = f"Strong bias from features: {', '.join(strong_features)}"
        message = f"Model shows bias due to strong correlations in features like {', '.join(strong_features[:2])}"
    else:
        reason = "No strong proxy features detected"
        message = "Model bias is relatively controlled"

    return {
        "overall_bias": overall,
        "mitigation_impact": impact,
        "reason": reason,
        "message": message
    }


# ==============================
# 🤖 MODEL RUNNER
# ==============================
def run_models(df_model, audit_df):
    target_column = df_model.columns[-1]

    X = df_model.drop(columns=[target_column]).copy()
    y = df_model[target_column].copy()

    # encoding
    for col in X.columns:
        X[col] = X[col].astype(str).str.strip()
        X[col] = pd.factorize(X[col])[0]

    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)
    y = pd.to_numeric(y, errors='coerce').fillna(0).astype(int)

    # split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    audit_train = audit_df.iloc[y_train.index]
    audit_test = audit_df.iloc[y_test.index]

    # 🔥 add noise (stability)
    noise_idx = np.random.choice(len(y_train), size=int(0.2 * len(y_train)), replace=False)
    y_train.iloc[noise_idx] = 1 - y_train.iloc[noise_idx]
    X_train = X_train + np.random.normal(0, 0.01, X_train.shape)

    # ==============================
    # 🔴 BEFORE
    # ==============================
    lr_model = LogisticRegression(max_iter=200, C=0.05)
    lr_model.fit(X_train, y_train)

    pred_before = lr_model.predict(X_test)
    bias_before = detect_bias_all_columns(audit_test, pred_before)
    avg_before = calculate_avg_bias(bias_before)

    # ==============================
    # 🟢 MITIGATION
    # ==============================
    if "gender" in audit_train.columns:
        weights = compute_sample_weights(audit_train, "gender", y_train)
    else:
        weights = [1] * len(y_train)

    lr_model.fit(X_train, y_train, sample_weight=weights)

    pred_after = lr_model.predict(X_test)
    bias_after = detect_bias_all_columns(audit_test, pred_after)
    avg_after = calculate_avg_bias(bias_after)

    feature, _ = most_biased_feature(bias_after)

    # ==============================
    # 🧠 SUMMARY
    # ==============================
    summary = generate_summary(bias_after, avg_before, avg_after)

    return {
        "summary": summary,
        "most_biased_feature": feature,
        "bias_report": bias_after
    }


# ==============================
# 🚀 MAIN API
# ==============================
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    file_path = data.get("file_path")

    try:
        df = pd.read_csv(file_path)
        df = df.dropna()

        # remove PII
        pii_cols = ["name", "email", "aadhaar", "phone"]
        df = df.drop(columns=[col for col in pii_cols if col in df.columns], errors="ignore")

        sensitive_cols = ["gender", "age"]

        audit_df = df.copy()

        df_with = df.copy()
        df_without = df.drop(
            columns=[col for col in sensitive_cols if col in df.columns],
            errors="ignore"
        )

        data_bias_report = detect_data_bias(audit_df)

        result_with = run_models(df_with, audit_df)
        result_without = run_models(df_without, audit_df)

        # privacy insight
        if result_without["summary"]["overall_bias"] < result_with["summary"]["overall_bias"]:
            privacy_insight = "Removing sensitive features reduced bias"
        else:
            privacy_insight = "Bias still exists due to proxy features"

        return jsonify({
            "data_bias": data_bias_report,
            "with_sensitive": result_with,
            "without_sensitive": result_without,
            "privacy_insight": privacy_insight
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
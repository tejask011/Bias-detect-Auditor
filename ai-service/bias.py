import pandas as pd

# 🔥 Define sensitive columns (expand anytime)
SENSITIVE_COLS = ["gender", "caste", "age"]


# ✅ Select only valid categorical columns
def get_categorical_columns(df):
    exclude_cols = ["prediction", "target"]

    categorical_cols = []

    for col in df.columns:
        if col in exclude_cols:
            continue

        if df[col].nunique() <= 10:
            categorical_cols.append(col)

    return categorical_cols


# 🔥 Bias Type (NEW)
def get_bias_type(col):
    if col.lower() in SENSITIVE_COLS:
        return "Sensitive Bias 🚨"
    return "General Pattern ⚠️"


# 🔥 Severity Level (NEW)
def get_severity(score):
    if score < 0.1:
        return "Low 🟢"
    elif score < 0.3:
        return "Medium 🟡"
    else:
        return "High 🔴"


# 🔥 SMART INSIGHT FUNCTION
def get_bias_insight(feature, group_rates, bias_score):
    if bias_score == 0:
        return f"No bias detected in '{feature}'"

    max_group = max(group_rates, key=group_rates.get)
    min_group = min(group_rates, key=group_rates.get)

    return f"{feature} is biased: '{max_group}' is favored over '{min_group}'"


# ✅ Main bias detection
def detect_bias_all_columns(df, predictions):
    df = df.copy()
    df["prediction"] = predictions

    categorical_cols = get_categorical_columns(df)
    bias_report = {}

    for col in categorical_cols:
        groups = df[col].dropna().unique()

        if len(groups) < 2:
            continue

        group_rates = {}

        for group in groups:
            group_data = df[df[col] == group]

            if len(group_data) == 0:
                continue

            positive_rate = (group_data["prediction"] == 1).mean()
            group_rates[str(group)] = round(float(positive_rate), 3)

        values = list(group_rates.values())
        if len(values) < 2:
            continue

        bias_score = round(max(values) - min(values), 3)

        bias_report[col] = {
            "group_rates": group_rates,
            "bias_score": bias_score,
            "label": bias_label(bias_score),
            "insight": get_bias_insight(col, group_rates, bias_score),

            # 🔥 NEW FIELDS
            "type": get_bias_type(col),
            "severity": get_severity(bias_score)
        }

    return bias_report


# ✅ Find most biased feature
def most_biased_feature(bias_report):
    max_bias = 0
    worst_feature = None

    for feature, data in bias_report.items():
        if data["bias_score"] > max_bias:
            max_bias = data["bias_score"]
            worst_feature = feature

    return worst_feature, round(max_bias, 3)


# ✅ Label bias level
def bias_label(score):
    if score < 0.1:
        return "Fair ✅"
    elif score < 0.2:
        return "Moderate ⚠️"
    else:
        return "Highly Biased ❌"
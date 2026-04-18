import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle, Shield } from "lucide-react";

export default function Dashboard({ setUser }) {

  // ✅ DEFAULT DATA (prevents blank UI)
  const [data, setData] = useState({
    data_bias: {
      Age: { A: 30, B: 35 },
      Gender: { M: 50, F: 32 },
      Income: { Low: 20, High: 40 },
      Education: { Grad: 20, UG: 30 },
    },
    with_sensitive: {
      logistic_regression: {
        before_mitigation: 0.68,
        after_mitigation: 0.35,
        improvement: 48.5,
        most_biased_feature: "Gender",
      },
      random_forest: {
        max_bias_score: 0.42,
        most_biased_feature: "Income",
      },
    },
    privacy_insight: "Bias still exists due to proxy features",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Upload
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:5000/upload", formData);

      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed (check backend)");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Chart data safe
  const getChartData = () => {
    if (!data?.data_bias) return [];

    return Object.keys(data.data_bias).map((col) => {
      const total = Object.values(data.data_bias[col]).reduce(
        (a, b) => a + b,
        0
      );
      return { category: col, distribution: total };
    });
  };

  const colors = ["#14b8a6", "#f97316", "#06b6d4", "#fb923c", "#0891b2"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-cyan-50 overflow-hidden">

      {/* 🔥 Background blobs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-orange-400/20 blur-3xl rounded-full"
      />
      <motion.div
        animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-cyan-400/20 blur-3xl rounded-full"
      />

      <div className="relative max-w-7xl mx-auto p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              AI Fairness Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time algorithmic bias detection & mitigation
            </p>
          </div>

          <button
            onClick={() => setUser(null)}
            className="px-6 py-3 bg-white rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Logout
          </button>
        </div>

        {/* UPLOAD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl shadow-xl mb-8"
        >
          <div className="flex gap-4">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 p-3 rounded-xl border"
            />

            <button
              onClick={handleUpload}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </motion.div>

        {/* CHART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl shadow-xl mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">
            Categorical Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="distribution">
                {getChartData().map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* MODELS */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Logistic */}
          <motion.div className="bg-white/70 p-6 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              Logistic Regression
            </h3>

            <p className="text-gray-500">Bias Before</p>
            <div className="text-3xl text-red-500 font-bold">
              {data?.with_sensitive?.logistic_regression?.before_mitigation?.toFixed(2)}
            </div>

            <p className="text-gray-500 mt-3">Bias After</p>
            <div className="text-3xl text-green-500 font-bold">
              {data?.with_sensitive?.logistic_regression?.after_mitigation?.toFixed(2)}
            </div>

            <p className="text-gray-500 mt-3">Improvement</p>
            <div className="text-2xl text-blue-500 font-bold">
              {data?.with_sensitive?.logistic_regression?.improvement}%
            </div>

            <p className="mt-4 text-gray-600">
              Most Biased:{" "}
              <span className="text-orange-500 font-bold">
                {data?.with_sensitive?.logistic_regression?.most_biased_feature}
              </span>
            </p>
          </motion.div>

          {/* Random Forest */}
          <motion.div className="bg-white/70 p-6 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">Random Forest</h3>

            <p className="text-gray-500 mt-2">Interpretation</p>
<p className="text-sm text-gray-700">
  {data?.with_sensitive?.random_forest?.max_bias_score > 0.5
    ? "High bias detected. Model is unfair."
    : "Moderate bias. Needs monitoring."}
</p>
            

            <p className="text-gray-500">Bias Score</p>
            <div className="text-4xl text-teal-500 font-bold">
              {data?.with_sensitive?.random_forest?.max_bias_score?.toFixed(2)}
            </div>

            <p className="mt-4 text-gray-600">
              Most Biased:{" "}
              <span className="text-teal-500 font-bold">
                {data?.with_sensitive?.random_forest?.most_biased_feature}
              </span>
            </p>
          </motion.div>
        </div>

        {/* INSIGHTS */}
        <div className="grid md:grid-cols-2 gap-6">

          <motion.div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-orange-500" />
              <h3 className="font-bold">Critical Bias</h3>
            </div>

            <p className="text-gray-700">
              {data?.with_sensitive?.logistic_regression?.improvement > 30
                ? "Bias significantly reduced after mitigation."
                : "Bias still exists. Further mitigation required."}
            </p>
          </motion.div>

          <motion.div className="bg-cyan-50 border border-cyan-200 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-cyan-500" />
              <h3 className="font-bold">Privacy Safe</h3>
            </div>

            <p className="text-gray-700">
              {data?.privacy_insight || "All attributes are anonymized."}
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
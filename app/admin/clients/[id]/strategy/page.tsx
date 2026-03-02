"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const platformOptions = ["Facebook", "Instagram", "LINE", "TikTok", "YouTube", "Threads", "X (Twitter)", "LinkedIn"];

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandName, setBrandName] = useState("");

  // 品牌人設
  const [brandPersonality, setBrandPersonality] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [brandTaboos, setBrandTaboos] = useState("");

  // 受眾輪廓
  const [audienceAge, setAudienceAge] = useState("");
  const [audienceGender, setAudienceGender] = useState("");
  const [audienceLocation, setAudienceLocation] = useState("");
  const [audienceOccupation, setAudienceOccupation] = useState("");
  const [audiencePainPoints, setAudiencePainPoints] = useState("");
  const [audiencePlatforms, setAudiencePlatforms] = useState<string[]>([]);
  const [audienceDecisionFactors, setAudienceDecisionFactors] = useState("");

  // 品牌聲量
  const [valueProposition, setValueProposition] = useState("");
  const [keyMessages, setKeyMessages] = useState<string[]>([""]);
  const [competitorDiff, setCompetitorDiff] = useState("");

  // 經營設定
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [platformPositions, setPlatformPositions] = useState<Record<string, string>>({});
  const [postFrequency, setPostFrequency] = useState("");
  const [kpiTargets, setKpiTargets] = useState({
    followers: "",
    engagement: "",
    reach: "",
    conversion: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 取得客戶名稱
      const clientRes = await fetch(`/api/admin/clients/${id}`);
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setBrandName(clientData.brandName);
      }

      // 取得策略資料
      const stratRes = await fetch(`/api/admin/clients/${id}/strategy`);
      if (stratRes.ok) {
        const data = await stratRes.json();
        // 品牌人設
        setBrandPersonality(data.brandPersonality || "");
        setBrandTone(data.brandTone || "");
        setBrandTaboos(data.brandTaboos || "");
        // 受眾輪廓
        setAudienceAge(data.audienceAge || "");
        setAudienceGender(data.audienceGender || "");
        setAudienceLocation(data.audienceLocation || "");
        setAudienceOccupation(data.audienceOccupation || "");
        setAudiencePainPoints(data.audiencePainPoints || "");
        setAudiencePlatforms(data.audiencePlatforms ? JSON.parse(data.audiencePlatforms) : []);
        setAudienceDecisionFactors(data.audienceDecisionFactors || "");
        // 品牌聲量
        setValueProposition(data.valueProposition || "");
        setKeyMessages(data.keyMessages ? JSON.parse(data.keyMessages) : [""]);
        setCompetitorDiff(data.competitorDiff || "");
        // 經營設定
        setPlatforms(data.platforms ? JSON.parse(data.platforms) : []);
        setPlatformPositions(data.platformPositions ? JSON.parse(data.platformPositions) : {});
        setPostFrequency(data.postFrequency || "");
        setKpiTargets(data.kpiTargets ? JSON.parse(data.kpiTargets) : { followers: "", engagement: "", reach: "", conversion: "" });
      }
    } catch (err) {
      console.error("Fetch strategy error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/strategy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandPersonality: brandPersonality || null,
          brandTone: brandTone || null,
          brandTaboos: brandTaboos || null,
          audienceAge: audienceAge || null,
          audienceGender: audienceGender || null,
          audienceLocation: audienceLocation || null,
          audienceOccupation: audienceOccupation || null,
          audiencePainPoints: audiencePainPoints || null,
          audiencePlatforms: audiencePlatforms.length > 0 ? JSON.stringify(audiencePlatforms) : null,
          audienceDecisionFactors: audienceDecisionFactors || null,
          valueProposition: valueProposition || null,
          keyMessages: keyMessages.filter(Boolean).length > 0 ? JSON.stringify(keyMessages.filter(Boolean)) : null,
          competitorDiff: competitorDiff || null,
          platforms: platforms.length > 0 ? JSON.stringify(platforms) : null,
          platformPositions: Object.keys(platformPositions).length > 0 ? JSON.stringify(platformPositions) : null,
          postFrequency: postFrequency || null,
          kpiTargets: JSON.stringify(kpiTargets),
        }),
      });

      if (res.ok) {
        router.push(`/admin/clients/${id}`);
      } else {
        alert("儲存失敗");
      }
    } catch {
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const toggleAudiencePlatform = (p: string) => {
    setAudiencePlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => {
      if (prev.includes(p)) {
        const next = prev.filter((x) => x !== p);
        const newPositions = { ...platformPositions };
        delete newPositions[p];
        setPlatformPositions(newPositions);
        return next;
      }
      return [...prev, p];
    });
  };

  const addKeyMessage = () => setKeyMessages([...keyMessages, ""]);
  const removeKeyMessage = (idx: number) => {
    if (keyMessages.length <= 1) return;
    setKeyMessages(keyMessages.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/clients" className="hover:text-blue-600">客戶管理</Link>
        <span>/</span>
        <Link href={`/admin/clients/${id}`} className="hover:text-blue-600">{brandName}</Link>
        <span>/</span>
        <span className="text-gray-900">品牌策略建檔</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">品牌策略建檔</h1>
      <p className="text-sm text-gray-500 mb-8">{brandName} 的品牌策略檔案</p>

      {/* === Section 1: 品牌人設 === */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>🎭</span> 品牌人設
        </h2>
        <p className="text-xs text-gray-500 mb-4">定義品牌的個性、語氣和風格禁區</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">品牌個性描述</label>
            <textarea
              value={brandPersonality}
              onChange={(e) => setBrandPersonality(e.target.value)}
              rows={3}
              placeholder="例如：親切、專業但不死板、像朋友一樣的語氣，帶有幽默感但不失專業度..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">說話語氣</label>
            <textarea
              value={brandTone}
              onChange={(e) => setBrandTone(e.target.value)}
              rows={2}
              placeholder="例如：溫暖、輕鬆、偶爾使用表情符號、用「你」而不是「您」..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">禁用詞彙 / 風格禁區</label>
            <textarea
              value={brandTaboos}
              onChange={(e) => setBrandTaboos(e.target.value)}
              rows={2}
              placeholder="例如：不使用網路用語、不碰政治議題、不用過度銷售的語氣..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* === Section 2: 受眾輪廓 === */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>👥</span> 受眾輪廓
        </h2>
        <p className="text-xs text-gray-500 mb-4">描述品牌的目標受眾特徵</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年齡範圍</label>
            <input
              type="text"
              value={audienceAge}
              onChange={(e) => setAudienceAge(e.target.value)}
              placeholder="例如：25-45 歲"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <select
              value={audienceGender}
              onChange={(e) => setAudienceGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">不限</option>
              <option value="女性為主">女性為主</option>
              <option value="男性為主">男性為主</option>
              <option value="男女均衡">男女均衡</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
            <input
              type="text"
              value={audienceLocation}
              onChange={(e) => setAudienceLocation(e.target.value)}
              placeholder="例如：台灣全區 / 北部都會區"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">職業</label>
            <input
              type="text"
              value={audienceOccupation}
              onChange={(e) => setAudienceOccupation(e.target.value)}
              placeholder="例如：上班族、小資族、家庭主婦"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">痛點 / 需求</label>
          <textarea
            value={audiencePainPoints}
            onChange={(e) => setAudiencePainPoints(e.target.value)}
            rows={3}
            placeholder="例如：想找到好的保養品但不知道怎麼選、害怕踩雷、希望有人推薦..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">常用社群平台</label>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleAudiencePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  audiencePlatforms.includes(p)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">消費決策因素</label>
          <textarea
            value={audienceDecisionFactors}
            onChange={(e) => setAudienceDecisionFactors(e.target.value)}
            rows={2}
            placeholder="例如：口碑推薦、價格、品牌信任度、成分天然..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* === Section 3: 品牌聲量 === */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>📢</span> 品牌聲量
        </h2>
        <p className="text-xs text-gray-500 mb-4">品牌要傳遞的核心訊息與差異化</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">核心價值主張（一句話）</label>
            <input
              type="text"
              value={valueProposition}
              onChange={(e) => setValueProposition(e.target.value)}
              placeholder="例如：讓每個人都能輕鬆擁有健康美肌"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">品牌關鍵訊息</label>
            {keyMessages.map((msg, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => {
                    const next = [...keyMessages];
                    next[idx] = e.target.value;
                    setKeyMessages(next);
                  }}
                  placeholder={`關鍵訊息 ${idx + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {keyMessages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyMessage(idx)}
                    className="px-3 py-2 text-red-400 hover:text-red-600 text-sm"
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addKeyMessage}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              + 新增關鍵訊息
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">競品差異化</label>
            <textarea
              value={competitorDiff}
              onChange={(e) => setCompetitorDiff(e.target.value)}
              rows={3}
              placeholder="例如：相比競品 A，我們更注重天然成分；相比競品 B，我們的價格更親民..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* === Section 4: 經營設定 === */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>⚙️</span> 經營設定
        </h2>
        <p className="text-xs text-gray-500 mb-4">社群經營的平台、定位與目標</p>

        <div className="space-y-4">
          {/* 經營平台 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">經營平台</label>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    platforms.includes(p)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 各平台定位 */}
          {platforms.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">各平台定位</label>
              <div className="space-y-3">
                {platforms.map((p) => (
                  <div key={p}>
                    <label className="block text-xs text-gray-500 mb-1">{p}</label>
                    <input
                      type="text"
                      value={platformPositions[p] || ""}
                      onChange={(e) =>
                        setPlatformPositions({ ...platformPositions, [p]: e.target.value })
                      }
                      placeholder={`${p} 的定位，例如：品牌形象展示、互動為主...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 發文頻率 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">發文頻率</label>
            <select
              value={postFrequency}
              onChange={(e) => setPostFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">請選擇</option>
              <option value="每天 1 篇">每天 1 篇</option>
              <option value="每週 3-5 篇">每週 3-5 篇</option>
              <option value="每週 2-3 篇">每週 2-3 篇</option>
              <option value="每週 1-2 篇">每週 1-2 篇</option>
              <option value="每月 4-8 篇">每月 4-8 篇</option>
            </select>
          </div>

          {/* KPI 目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KPI 目標</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">粉絲成長目標（月）</label>
                <input
                  type="text"
                  value={kpiTargets.followers}
                  onChange={(e) => setKpiTargets({ ...kpiTargets, followers: e.target.value })}
                  placeholder="例如：+500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">互動率目標</label>
                <input
                  type="text"
                  value={kpiTargets.engagement}
                  onChange={(e) => setKpiTargets({ ...kpiTargets, engagement: e.target.value })}
                  placeholder="例如：3%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">觸及率目標</label>
                <input
                  type="text"
                  value={kpiTargets.reach}
                  onChange={(e) => setKpiTargets({ ...kpiTargets, reach: e.target.value })}
                  placeholder="例如：10,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">轉換目標</label>
                <input
                  type="text"
                  value={kpiTargets.conversion}
                  onChange={(e) => setKpiTargets({ ...kpiTargets, conversion: e.target.value })}
                  placeholder="例如：每月 50 筆詢問"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3 mb-10">
        <Link
          href={`/admin/clients/${id}`}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          取消
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "儲存中..." : "儲存策略"}
        </button>
      </div>
    </div>
  );
}

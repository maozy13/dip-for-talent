import { useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Input,
  Progress,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Tree
} from "antd";
import type { DataNode } from "antd/es/tree";
import {
  BarChartOutlined,
  SearchOutlined,
  SendOutlined,
  RobotOutlined
} from "@ant-design/icons";
import classNames from "classnames";

const { Title, Text } = Typography;

const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

type RoiMetric = {
  id: string;
  name: string;
  current_value: number;
  benchmark_value: number;
  change_pct: number;
  achievement_pct: number;
  unit: string;
  trend: "up" | "down";
};

type RoiSummary = {
  updated_at: string;
  metrics: RoiMetric[];
};

type OrgNode = {
  id: string;
  name: string;
  owner: string;
  roi_value: number;
  benchmark_value: number;
  status: "good" | "warn" | "risk";
  headcount: number;
  sales_per_10k: number;
  sales_per_capita: number;
  cost_per_capita: number;
  children: OrgNode[];
};

type OrgTreeResponse = {
  updated_at: string;
  root: OrgNode;
};

type ScoreMetric = {
  id: string;
  name: string;
  current_value: number;
  benchmark_value: number;
  correlation: number;
  direction: "positive" | "negative";
};

type ScoreResponse = {
  updated_at: string;
  score: number;
  metrics: ScoreMetric[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatContext = {
  type: "metric" | "org" | "score" | "copilot";
  id?: string;
  title: string;
};

const statusMeta = {
  good: { label: "优于基准", color: "good" },
  warn: { label: "低于基准≤20%", color: "warn" },
  risk: { label: "低于基准>20%", color: "risk" }
} as const;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(value);

const buildTreeData = (node: OrgNode): DataNode => {
  const status = statusMeta[node.status];
  const title = (
    <Tooltip
      title={
        <div className="text-sm">
          <div>人员规模：{node.headcount}</div>
          <div>万元人力成本销售收入：{formatNumber(node.sales_per_10k)}</div>
          <div>人均销售额：{formatNumber(node.sales_per_capita)} 万</div>
          <div>人均人力成本：{formatNumber(node.cost_per_capita)} 万</div>
        </div>
      }
    >
      <div
        className={classNames(
          "rounded-xl border px-4 py-3 shadow-sm transition",
          "hover:shadow-md",
          {
            "border-green-200 bg-green-50": node.status === "good",
            "border-amber-200 bg-amber-50": node.status === "warn",
            "border-red-200 bg-red-50": node.status === "risk"
          }
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-ink">{node.name}</div>
            <div className="text-xs text-slate-500">负责人：{node.owner}</div>
          </div>
          <Badge color={status.color} text={status.label} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div>当前 ROI：{formatNumber(node.roi_value)}</div>
          <div>基准值：{formatNumber(node.benchmark_value)}</div>
        </div>
      </div>
    </Tooltip>
  );

  return {
    key: node.id,
    title,
    children: node.children?.map(buildTreeData)
  };
};

const buildKeyIndex = (node: OrgNode, parentKey?: string) => {
  const current = [{ key: node.id, name: node.name, parentKey }];
  return node.children.reduce(
    (acc, child) => acc.concat(buildKeyIndex(child, node.id)),
    current
  );
};

const ROI_METRIC_CONFIG = [
  {
    code: "#MTC-A7Q9",
    modelId: "d50hck5g5lk40hvh4880",
    name: "万元人力成本销售收入",
    unit: "万元"
  },
  {
    code: "#MTC-0E1C",
    modelId: "d50heldg5lk40hvh488g",
    name: "人均销售额",
    unit: "万元"
  },
  {
    code: "#MTC-3FE9",
    modelId: "d50hf5tg5lk40hvh4890",
    name: "人均人力成本",
    unit: "万元"
  }
];

const ORG_TREE_DATA: OrgTreeResponse = {
  updated_at: "即时",
  root: {
    id: "org-1",
    name: "全国销售中心",
    owner: "王珂",
    roi_value: 12.4,
    benchmark_value: 11.0,
    status: "good",
    headcount: 680,
    sales_per_10k: 12.4,
    sales_per_capita: 531.6,
    cost_per_capita: 47.2,
    children: [
      {
        id: "org-1-1",
        name: "华东大区",
        owner: "赵一鸣",
        roi_value: 13.1,
        benchmark_value: 11.4,
        status: "good",
        headcount: 240,
        sales_per_10k: 13.1,
        sales_per_capita: 552.3,
        cost_per_capita: 46.9,
        children: [
          {
            id: "org-1-1-1",
            name: "苏杭事业部",
            owner: "苏雨",
            roi_value: 12.6,
            benchmark_value: 11.8,
            status: "good",
            headcount: 110,
            sales_per_10k: 12.6,
            sales_per_capita: 540.8,
            cost_per_capita: 46.2,
            children: []
          },
          {
            id: "org-1-1-2",
            name: "宁波事业部",
            owner: "杨澜",
            roi_value: 10.2,
            benchmark_value: 11.8,
            status: "warn",
            headcount: 78,
            sales_per_10k: 10.2,
            sales_per_capita: 498.7,
            cost_per_capita: 48.9,
            children: []
          }
        ]
      },
      {
        id: "org-1-2",
        name: "华北大区",
        owner: "张澈",
        roi_value: 9.3,
        benchmark_value: 11.1,
        status: "risk",
        headcount: 210,
        sales_per_10k: 9.3,
        sales_per_capita: 478.4,
        cost_per_capita: 49.8,
        children: [
          {
            id: "org-1-2-1",
            name: "天津事业部",
            owner: "高航",
            roi_value: 8.6,
            benchmark_value: 10.9,
            status: "risk",
            headcount: 90,
            sales_per_10k: 8.6,
            sales_per_capita: 461.2,
            cost_per_capita: 50.4,
            children: []
          }
        ]
      },
      {
        id: "org-1-3",
        name: "华南大区",
        owner: "李岚",
        roi_value: 11.6,
        benchmark_value: 11.2,
        status: "good",
        headcount: 230,
        sales_per_10k: 11.6,
        sales_per_capita: 520.4,
        cost_per_capita: 45.7,
        children: [
          {
            id: "org-1-3-1",
            name: "深圳事业部",
            owner: "陈栩",
            roi_value: 11.1,
            benchmark_value: 11.0,
            status: "good",
            headcount: 95,
            sales_per_10k: 11.1,
            sales_per_capita: 512.8,
            cost_per_capita: 46.1,
            children: []
          }
        ]
      }
    ]
  }
};

const SCORE_DATA: ScoreResponse = {
  updated_at: "即时",
  score: 78.4,
  metrics: [
    {
      id: "score-1",
      name: "高绩效员工占比",
      current_value: 36.0,
      benchmark_value: 32.0,
      correlation: 0.86,
      direction: "positive"
    },
    {
      id: "score-2",
      name: "关键岗位空缺率",
      current_value: 4.3,
      benchmark_value: 3.1,
      correlation: -0.82,
      direction: "negative"
    },
    {
      id: "score-3",
      name: "销售转化周期",
      current_value: 28.0,
      benchmark_value: 25.0,
      correlation: -0.81,
      direction: "negative"
    }
  ]
};

const extractFirstValue = (values: unknown[]): number => {
  if (!values.length) return 0;
  const value = values[0];
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
};

const fetchRoiSummary = async (): Promise<RoiSummary> => {
  const body = ROI_METRIC_CONFIG.map(() => ({
    instant: true,
    start: Date.UTC(2025, 0, 1, 0, 0, 0, 0),
    end: Date.UTC(2025, 11, 31, 23, 59, 59, 999)
  }));
  const ids = ROI_METRIC_CONFIG.map((metric) => metric.modelId).join(",");
  const response = await fetch(
    `${apiBase}/api/mdl-uniquery/v1/metric-models/${ids}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HTTP-Method-Override": "GET"
      },
      body: JSON.stringify(body)
    }
  );
  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : [payload];
  const metrics: RoiMetric[] = results.map((result, index) => {
    const dataItems = result?.datas ?? [];
    const first = dataItems[0] ?? {};
    const currentValue = extractFirstValue(first.values ?? []);
    const growthValues = first.growth_values ?? [];
    const growthRates = first.growth_rates ?? [];
    const growthValue =
      growthValues.length > 0 ? extractFirstValue(growthValues) : null;
    const growthRate =
      growthRates.length > 0 ? extractFirstValue(growthRates) : null;
    const benchmarkValue =
      growthValue !== null ? currentValue - growthValue : currentValue;
    const achievementPct = benchmarkValue
      ? (currentValue / benchmarkValue) * 100
      : 0;
    const changePct = growthRate !== null ? growthRate * 100 : 0;
    const trend = currentValue >= benchmarkValue ? "up" : "down";
    const model = result?.model ?? {};
    const config = ROI_METRIC_CONFIG[index];

    return {
      id: config.code,
      name: model.name ?? config.name,
      current_value: currentValue,
      benchmark_value: benchmarkValue,
      change_pct: Number(changePct.toFixed(2)),
      achievement_pct: Number(achievementPct.toFixed(2)),
      unit: model.unit ?? config.unit,
      trend
    };
  });

  return {
    updated_at: new Date().toISOString(),
    metrics
  };
};

const App = () => {
  const [summary, setSummary] = useState<RoiSummary | null>(null);
  const [orgTree, setOrgTree] = useState<OrgTreeResponse | null>(null);
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [sending, setSending] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    const loadData = async () => {
      const summaryRes = await fetchRoiSummary();
      const treeRes = ORG_TREE_DATA;
      const scoreRes = SCORE_DATA;
      setSummary(summaryRes);
      setOrgTree(treeRes);
      setScore(scoreRes);
      if (treeRes?.root) {
        setExpandedKeys([treeRes.root.id]);
      }
    };
    loadData();
  }, []);

  const treeData = useMemo(() => {
    if (!orgTree) return [];
    return [buildTreeData(orgTree.root)];
  }, [orgTree]);

  const keyIndex = useMemo(() => {
    if (!orgTree) return [];
    return buildKeyIndex(orgTree.root);
  }, [orgTree]);

  useEffect(() => {
    if (!searchValue) {
      setAutoExpandParent(true);
      return;
    }
    const matchedKeys = keyIndex
      .filter((item) => item.name.includes(searchValue))
      .map((item) => item.parentKey)
      .filter(Boolean) as string[];
    setExpandedKeys(matchedKeys);
    setAutoExpandParent(true);
  }, [searchValue, keyIndex]);

  const openChat = (context: ChatContext, seed?: string) => {
    setChatContext(context);
    setDrawerOpen(true);
    if (seed) {
      setMessages([{ role: "assistant", content: seed }]);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!pendingMessage.trim() || !chatContext) return;
    const content = pendingMessage.trim();
    setPendingMessage("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content }]);
    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context_type: chatContext.type,
          context_id: chatContext.id,
          message: content
        })
      }).then((res) => res.json());
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply }
      ]);
    } finally {
      setSending(false);
    }
  };

  const summarySeed =
    "已聚焦人力资本ROI分析，可继续询问指标定义、趋势解读、根因分析或行动建议。";

  const scoreColumns = [
    {
      title: "指标项",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "当前值",
      dataIndex: "current_value",
      key: "current_value",
      render: (value: number) => <Text>{formatNumber(value)}</Text>
    },
    {
      title: "基准值",
      dataIndex: "benchmark_value",
      key: "benchmark_value",
      render: (value: number) => <Text type="secondary">{formatNumber(value)}</Text>
    },
    {
      title: "相关系数 (r)",
      dataIndex: "correlation",
      key: "correlation",
      render: (value: number, record: ScoreMetric) => (
        <Space>
          <Text>{value.toFixed(2)}</Text>
          <Tag color={record.direction === "positive" ? "green" : "volcano"}>
            {record.direction === "positive" ? "正相关" : "负相关"}
          </Tag>
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mist via-white to-amber-50 text-ink">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <BarChartOutlined />
              人力资本 ROI 分析
            </div>
            <Title level={2} className="!mb-1 !mt-2">
              人才洞察与ROI决策工作台
            </Title>
            <Text type="secondary">
              总览 → 组织结构 → 驱动因子，全局掌握ROI表现与关键风险。
            </Text>
          </div>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() =>
              openChat(
                { type: "copilot", title: "ROI Copilot" },
                summarySeed
              )
            }
          >
            ROI Copilot
          </Button>
        </div>

        <Divider className="!my-8" />

        <section>
          <div className="flex items-end justify-between">
            <div>
              <Title level={4} className="!mb-0">
                核心 ROI 指标总览
              </Title>
              <Text type="secondary">查看关键ROI指标与基准完成度</Text>
            </div>
            <Text type="secondary">
              {summary ? `更新于 ${summary.updated_at}` : "加载中"}
            </Text>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summary?.metrics.map((metric) => (
              <Card
                key={metric.id}
                className="rounded-2xl border-0 shadow-sm"
                bodyStyle={{ padding: 20 }}
                onClick={() =>
                  openChat(
                    {
                      type: "metric",
                      id: metric.id,
                      title: metric.name
                    },
                    `指标 ${metric.name} 当前值为 ${formatNumber(
                      metric.current_value
                    )}${metric.unit}，可继续查看计算口径与趋势解读。`
                  )
                }
                hoverable
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-500">{metric.id}</div>
                    <div className="text-lg font-semibold text-ink">
                      {metric.name}
                    </div>
                  </div>
                  <Tag color={metric.trend === "up" ? "green" : "volcano"}>
                    {metric.trend === "up" ? "↑" : "↓"}
                    {metric.change_pct}%
                  </Tag>
                </div>

                <div className="mt-4 text-3xl font-semibold">
                  {formatNumber(metric.current_value)}
                  <span className="ml-1 text-sm text-slate-500">
                    {metric.unit}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  较基准变化 {metric.change_pct}%（基准值
                  {formatNumber(metric.benchmark_value)}）
                </div>
                <div className="mt-4">
                  <Progress
                    percent={metric.achievement_pct}
                    showInfo={false}
                    strokeColor="#b45309"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    达成率 {metric.achievement_pct}%
                  </div>
                </div>
                <Button
                  type="link"
                  className="mt-2 !px-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    openChat(
                      {
                        type: "metric",
                        id: metric.id,
                        title: metric.name
                      },
                      `已打开 ${metric.name} 详情，可查看计算规则、趋势和行动建议。`
                    );
                  }}
                >
                  查看指标计算规则和趋势
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <Divider className="!my-10" />

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Title level={4} className="!mb-0">
                组织结构 & ROI 分布
              </Title>
              <Text type="secondary">
                树状结构下钻组织层级，定位ROI异常区域
              </Text>
            </div>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索组织"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-white/70 p-4 shadow-sm">
            {treeData.length > 0 && (
              <Tree
                showLine
                blockNode
                className="bg-transparent"
                treeData={treeData}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={(keys) => {
                  setExpandedKeys(keys);
                  setAutoExpandParent(false);
                }}
                onSelect={(keys) => {
                  const selected = keys[0] as string | undefined;
                  if (!selected || !orgTree) return;
                  const node = keyIndex.find((item) => item.key === selected);
                  if (!node) return;
                  openChat(
                    { type: "org", id: selected, title: node.name },
                    `组织 ${node.name} 已打开，建议查看指标趋势与行动建议。`
                  );
                }}
              />
            )}
          </div>
        </section>

        <Divider className="!my-10" />

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Title level={4} className="!mb-0">
                人效关联指标
              </Title>
              <Text type="secondary">
                仅展示与ROI相关系数 |r| ≥ 0.8 的指标
              </Text>
            </div>
            <Text type="secondary">
              {score ? `更新于 ${score.updated_at}` : "加载中"}
            </Text>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_2fr]">
            <Card className="rounded-2xl border-0 shadow-sm">
              <div className="text-xs text-slate-500">人效评分</div>
              <div className="mt-4 text-5xl font-semibold text-ink">
                {score ? score.score.toFixed(1) : "--"}
              </div>
              <div className="mt-3 text-sm text-slate-500">
                综合业务与人力指标计算结果
              </div>
              <Button
                type="primary"
                className="mt-6"
                onClick={() =>
                  openChat(
                    { type: "score", title: "人效评分" },
                    "人效评分已展开，可继续查看现状与原因分析。"
                  )
                }
              >
                查看评分解读
              </Button>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <Table
                dataSource={score?.metrics ?? []}
                columns={scoreColumns}
                rowKey="id"
                pagination={false}
                size="middle"
                onRow={(record) => ({
                  onClick: () =>
                    openChat(
                      { type: "score", id: record.id, title: record.name },
                      `指标 ${record.name} 与ROI高度相关，可查看趋势与行动建议。`
                    )
                })}
              />
            </Card>
          </div>
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        width={420}
        onClose={() => setDrawerOpen(false)}
        title={chatContext?.title ?? "ChatKit"}
        className="chat-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            {chatContext?.type === "copilot"
              ? "可围绕人力资本ROI指标、趋势解读、根因分析和行动建议进行提问。"
              : "该侧滑面板聚焦当前选中内容，可继续追问获取洞察。"}
          </div>
          <div className="mt-4 flex-1 space-y-3 overflow-auto pr-1">
            {messages.length === 0 && (
              <div className="text-sm text-slate-400">
                请输入问题以开始对话
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={classNames("flex", {
                  "justify-end": message.role === "user"
                })}
              >
                <div
                  className={classNames(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-ink text-white"
                      : "bg-white shadow-sm"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input.TextArea
              value={pendingMessage}
              onChange={(event) => setPendingMessage(event.target.value)}
              placeholder="输入问题，回车发送"
              autoSize={{ minRows: 2, maxRows: 4 }}
              onPressEnter={(event) => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sending}
              onClick={sendMessage}
            >
              发送
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default App;

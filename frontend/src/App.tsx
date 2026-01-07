import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Descriptions,
  Layout,
  Space,
  Spin,
  Table,
  Tag,
  Typography
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;

interface DataProperty {
  name: string;
  display_name?: string;
  type?: string;
  comment?: string;
  index?: boolean;
  mapped_field?: {
    name?: string;
    type?: string;
  };
}

interface LogicProperty {
  name?: string;
  display_name?: string;
  type?: string;
  comment?: string;
}

interface ConceptGroup {
  id: string;
  name: string;
}

interface ObjectTypeDetail {
  id: string;
  name: string;
  comment?: string;
  tags?: string[];
  kn_id?: string;
  color?: string;
  icon?: string;
  branch?: string;
  module_type?: string;
  display_key?: string;
  primary_keys?: string[];
  data_properties?: DataProperty[];
  logic_properties?: LogicProperty[];
  concept_groups?: ConceptGroup[];
  data_source?: {
    id?: string;
    name?: string;
    type?: string;
  };
  creator?: string;
  updater?: string;
  create_time?: number;
  update_time?: number;
  detail?: string;
}

interface ApiResponse {
  object_type?: ObjectTypeDetail;
  datas?: Array<Record<string, unknown>>;
  total_count?: number;
}

const formatTime = (value?: number) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", { hour12: false });
};

export default function App() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/object-type-detail");
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        const payload: ApiResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "未知错误");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const objectType = data?.object_type;

  const dataPropertyColumns = useMemo(
    () => [
      {
        title: "名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "显示名",
        dataIndex: "display_name",
        key: "display_name",
        render: (value: string) => value || "-"
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (value: string) => value || "-"
      },
      {
        title: "映射字段",
        key: "mapped_field",
        render: (_: unknown, record: DataProperty) =>
          record.mapped_field?.name ? (
            <Space direction="vertical" size={0}>
              <Text>{record.mapped_field?.name}</Text>
              <Text type="secondary">{record.mapped_field?.type || "-"}</Text>
            </Space>
          ) : (
            "-"
          )
      },
      {
        title: "索引",
        dataIndex: "index",
        key: "index",
        render: (value: boolean) => (value ? "是" : "否")
      },
      {
        title: "说明",
        dataIndex: "comment",
        key: "comment",
        render: (value: string) => value || "-"
      }
    ],
    []
  );

  const logicPropertyColumns = useMemo(
    () => [
      {
        title: "名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "显示名",
        dataIndex: "display_name",
        key: "display_name",
        render: (value: string) => value || "-"
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (value: string) => value || "-"
      },
      {
        title: "说明",
        dataIndex: "comment",
        key: "comment",
        render: (value: string) => value || "-"
      }
    ],
    []
  );

  return (
    <Layout className="app-shell min-h-screen">
      <Header className="bg-transparent px-6 py-8">
        <div className="mx-auto max-w-6xl fade-in">
          <Title level={2} className="!mb-1 !text-slate-100">
            业务知识网络对象类详情
          </Title>
          <Paragraph className="!mb-0 !text-slate-300">
            快速查看对象类元数据、属性结构与数据概览，支持后续分析或应用编排。
          </Paragraph>
        </div>
      </Header>
      <Content className="px-6 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          {loading && (
            <Card className="glass-card" bordered={false}>
              <Space direction="vertical" size="middle" align="center" className="w-full">
                <Spin size="large" />
                <Text className="text-slate-200">正在读取对象类信息...</Text>
              </Space>
            </Card>
          )}
          {error && (
            <Alert
              type="error"
              message="获取失败"
              description={error}
              showIcon
            />
          )}
          {!loading && !error && !objectType && (
            <Card className="glass-card" bordered={false}>
              <Space direction="vertical" align="center" className="w-full">
                <Text className="text-slate-200">未返回对象类信息</Text>
              </Space>
            </Card>
          )}
          {!loading && !error && objectType && (
            <div className="space-y-6 stagger">
              <Card
                className="glass-card"
                bordered={false}
                title={
                  <Space align="center" size="middle">
                    <div className="h-3 w-3 rounded-full" style={{ background: objectType.color || "#38bdf8" }} />
                    <span className="text-slate-100">{objectType.name}</span>
                  </Space>
                }
                extra={<Tag className="tag-chip text-slate-200">{objectType.module_type || "object_type"}</Tag>}
              >
                <Descriptions column={{ xs: 1, md: 2 }} layout="vertical" size="small" className="text-slate-100">
                  <Descriptions.Item label="对象类 ID">{objectType.id}</Descriptions.Item>
                  <Descriptions.Item label="知识网络 ID">{objectType.kn_id || "-"}</Descriptions.Item>
                  <Descriptions.Item label="显示属性">{objectType.display_key || "-"}</Descriptions.Item>
                  <Descriptions.Item label="主键">{objectType.primary_keys?.join(", ") || "-"}</Descriptions.Item>
                  <Descriptions.Item label="创建人">{objectType.creator || "-"}</Descriptions.Item>
                  <Descriptions.Item label="更新人">{objectType.updater || "-"}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{formatTime(objectType.create_time)}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{formatTime(objectType.update_time)}</Descriptions.Item>
                  <Descriptions.Item label="备注" span={2}>
                    {objectType.comment || "-"}
                  </Descriptions.Item>
                </Descriptions>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(objectType.tags || []).length === 0 && (
                    <Tag className="tag-chip text-slate-200">暂无标签</Tag>
                  )}
                  {(objectType.tags || []).map((tag) => (
                    <Tag key={tag} className="tag-chip text-slate-200">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className="mt-4">
                  <Text className="text-slate-400">概念分组：</Text>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(objectType.concept_groups || []).length === 0 && (
                      <Tag className="tag-chip text-slate-200">未归类</Tag>
                    )}
                    {(objectType.concept_groups || []).map((group) => (
                      <Tag key={group.id} className="tag-chip text-slate-200">
                        {group.name}
                      </Tag>
                    ))}
                  </div>
                </div>
                {objectType.data_source && (
                  <div className="mt-6 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                    <Title level={5} className="!mb-3 !text-slate-100">
                      数据来源
                    </Title>
                    <Descriptions column={{ xs: 1, md: 3 }} size="small" className="text-slate-100">
                      <Descriptions.Item label="类型">{objectType.data_source.type || "-"}</Descriptions.Item>
                      <Descriptions.Item label="名称">{objectType.data_source.name || "-"}</Descriptions.Item>
                      <Descriptions.Item label="ID">{objectType.data_source.id || "-"}</Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </Card>

              <Card className="glass-card" bordered={false}>
                <Title level={4} className="!mb-3 !text-slate-100">
                  数据属性
                </Title>
                {objectType.data_properties && objectType.data_properties.length > 0 ? (
                  <Table
                    dataSource={objectType.data_properties}
                    columns={dataPropertyColumns}
                    rowKey={(record) => record.name}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                ) : (
                  <Empty description="暂无数据属性" />
                )}
              </Card>

              <Card className="glass-card" bordered={false}>
                <Title level={4} className="!mb-3 !text-slate-100">
                  逻辑属性
                </Title>
                {objectType.logic_properties && objectType.logic_properties.length > 0 ? (
                  <Table
                    dataSource={objectType.logic_properties}
                    columns={logicPropertyColumns}
                    rowKey={(record, index) => record.name || `logic-${index}`}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                ) : (
                  <Empty description="暂无逻辑属性" />
                )}
              </Card>

              <Card className="glass-card" bordered={false}>
                <Title level={4} className="!mb-3 !text-slate-100">
                  实例数据概览
                </Title>
                <Paragraph className="!text-slate-300">
                  返回实例数量：{data?.total_count ?? "-"}
                </Paragraph>
                {data?.datas && data.datas.length > 0 ? (
                  <pre className="max-h-72 overflow-auto rounded-2xl bg-slate-950/70 p-4 text-xs text-slate-200">
                    {JSON.stringify(data.datas.slice(0, 5), null, 2)}
                  </pre>
                ) : (
                  <Empty description="暂无实例数据" />
                )}
              </Card>
            </div>
          )}
        </div>
      </Content>
      <Footer className="bg-transparent text-center text-slate-500">
        <Text type="secondary">DIP 业务知识网络对象类详情</Text>
      </Footer>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card, Modal, Tag } from 'antd';
import { addOssDataAPI, delOssDataAPI, editOssDataAPI, getOssListAPI, enableOssDataAPI, disableOssDataAPI, getOssDataAPI } from '@/api/Oss';
import type { Oss } from '@/types/app/oss';
import Title from '@/components/Title';
import type { ColumnsType } from 'antd/es/table';
import { titleSty } from '@/styles/sty';

const StoragePage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oss, setOss] = useState<Oss>({} as Oss);
    const [ossList, setOssList] = useState<Oss[]>([]);
    const [form] = Form.useForm();

    const columns: ColumnsType<Oss> = [
        { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
        {
            title: '状态',
            fixed: 'left',
            dataIndex: 'isEnable',
            key: 'isEnable',
            align: 'center',
            width: 150,
            render: (isEnable: number) => (
                <div className='space-x-2'>
                    <span className={`inline-block w-3 h-3 ${isEnable ? 'bg-green-500' : 'bg-red-500'} rounded-full`} />
                    <span>{isEnable ? '开启' : '禁用'}</span>
                </div>
            )
        },
        {
            title: '平台',
            dataIndex: 'platform',
            key: 'platform',
            align: 'center',
            width: 120,
            render: (text: string) => (
                <div>{text}</div>
            )
        },
        // { title: 'Access Key', dataIndex: 'accessKey', key: 'accessKey' },
        // { title: 'Secret Key', dataIndex: 'secretKey', key: 'secretKey' },
        { title: '地域', dataIndex: 'endPoint', key: 'endPoint' },
        { title: '存储桶', dataIndex: 'bucketName', key: 'bucketName' },
        { title: '域名', dataIndex: 'domain', key: 'domain' },
        { title: '根目录', dataIndex: 'basePath', key: 'basePath', align: 'center', width: 120 },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: 280,
            render: (_, record: Oss) => (
                <div className='space-x-2'>
                    {record.isEnable ? (
                        <Button type="primary" danger onClick={() => handleDisable(record.id!)}>禁用</Button>
                    ) : (
                        <Button type="primary" onClick={() => handleEnable(record.id!)}>启用</Button>
                    )}

                    <Button onClick={() => editOssData(record)}>修改</Button>

                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delOssData(record.id!)}>
                        <Button type="primary" danger>删除</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const getOssList = async () => {
        setLoading(true);
        const { data } = await getOssListAPI();
        setOssList(data as Oss[]);
        setLoading(false);
    };

    useEffect(() => {
        getOssList();
    }, []);

    const handleEnable = async (id: number) => {
        await enableOssDataAPI(id);
        message.success('启用成功');
        getOssList();
    };

    const handleDisable = async (id: number) => {
        await disableOssDataAPI(id);
        message.success('禁用成功');
        getOssList();
    };

    const editOssData = async (record: Oss) => {
        setOss(record);
        const { data } = await getOssDataAPI(record.id)
        form.setFieldsValue(data);
        setIsModalOpen(true);
    };

    const delOssData = async (id: number) => {
        setLoading(true);
        await delOssDataAPI(id);
        message.success('🎉 删除存储配置成功');
        getOssList();
    };

    const handleAdd = () => {
        setOss({} as Oss);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const onSubmit = async () => {
        setBtnLoading(true);

        try {
            const values = await form.validateFields();

            if (oss.id) {
                await editOssDataAPI({ ...oss, ...values });
                message.success('🎉 编辑存储配置成功');
            } else {
                await addOssDataAPI(values);
                message.success('🎉 新增存储配置成功');
            }

            setIsModalOpen(false);
            getOssList();
            form.resetFields();
        } catch (error) {
            console.error('表单验证失败:', error);
        }

        setBtnLoading(false);
    };

    return (
        <>
            <Title value="存储管理">
                <Button type="primary" size='large' onClick={handleAdd}>新增配置</Button>
            </Title>

            <Card className={`${titleSty} min-h-[calc(100vh-180px)]`}>
                <Table
                    rowKey="id"
                    dataSource={ossList}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        position: ['bottomCenter'],
                        pageSize: 8
                    }}
                    loading={loading}
                />
            </Card>

            <Modal
                title={oss.id ? "编辑存储配置" : "新增存储配置"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={oss}
                    onFinish={onSubmit}
                    size='large'
                    className='mt-6'
                >
                    <Form.Item
                        label="平台名称"
                        name="platform"
                        rules={[{ required: true, message: '平台名称不能为空' }]}
                    >
                        <Input placeholder="请输入平台名称" />
                    </Form.Item>

                    <Form.Item
                        label="Access Key"
                        name="accessKey"
                        rules={[
                            { required: true, message: 'Access Key 不能为空' },
                            { min: 10, max: 50, message: 'Access Key 限制在10~50个字符' }
                        ]}
                    >
                        <Input placeholder="请输入Access Key" />
                    </Form.Item>

                    <Form.Item
                        label="SecretKey"
                        name="secretKey"
                        rules={[{ required: true, message: 'SecretKey不能为空' }]}
                    >
                        <Input.Password placeholder="请输入SecretKey" />
                    </Form.Item>

                    <Form.Item
                        label="EndPoint"
                        name="endPoint"
                        rules={[{ required: true, message: 'EndPoint不能为空' }]}
                    >
                        <Input placeholder="请输入EndPoint" />
                    </Form.Item>

                    <Form.Item
                        label="Bucket名称"
                        name="bucketName"
                        rules={[{ required: true, message: 'Bucket名称不能为空' }]}
                    >
                        <Input placeholder="请输入Bucket名称" />
                    </Form.Item>

                    <Form.Item
                        label="域名"
                        name="domain"
                        rules={[{ required: true, message: '域名不能为空' }]}
                    >
                        <Input placeholder="请输入域名" />
                    </Form.Item>

                    <Form.Item
                        label="基础路径"
                        name="basePath"
                        rules={[{ required: true, message: '基础路径不能为空' }]}
                    >
                        <Input placeholder="请输入基础路径" />
                    </Form.Item>

                    <Form.Item className='mb-0'>
                        <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
                            {oss.id ? '保存修改' : '新增配置'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default StoragePage;
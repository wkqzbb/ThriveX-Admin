import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card } from 'antd';
import { getTagListAPI, addTagDataAPI, editTagDataAPI, delTagDataAPI, getTagDataAPI } from '@/api/Tag';
import { Tag } from '@/types/app/tag';
import Title from '@/components/Title';
import { ColumnsType } from 'antd/es/table';

const TagPage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState(false)

    const [form] = Form.useForm();

    const [tag, setTag] = useState<Tag>({} as Tag);
    const [list, setList] = useState<Tag[]>([]);

    const columns: ColumnsType<Tag> = [
        { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
        { title: '标签名称', dataIndex: 'name', key: 'name', align: 'center' },
        {
            title: '操作', key: 'action',
            render: (text: string, record: Tag) => (
                <>
                    <Button onClick={() => editTagData(record)}>修改</Button>
                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delTagData(record.id!)}>
                        <Button type="primary" danger className="ml-2">删除</Button>
                    </Popconfirm>
                </>
            )
        }
    ];

    const getTagList = async () => {
        try {
            const { data } = await getTagListAPI();
            setList(data as Tag[]);
        } catch (error) {
            setLoading(false);
        }

        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getTagList();
    }, []);

    const editTagData = async (record: Tag) => {
        setLoading(true);

        try {
            const { data } = await getTagDataAPI(record.id)
            setTag(data);
            form.setFieldsValue(data);
        } catch (error) {
            setLoading(false);
        }

        setLoading(false);
    };

    const delTagData = async (id: number) => {
        setLoading(true);

        try {
            await delTagDataAPI(id);
            await getTagList();
            message.success('🎉 删除标签成功');
        } catch (error) {
            setLoading(false);
        }
    };

    const onSubmit = async () => {
        setLoading(true);
        setBtnLoading(true);

        try {
            form.validateFields().then(async (values: Tag) => {
                if (tag.id) {
                    await editTagDataAPI({ ...tag, ...values });
                    message.success('🎉 编辑标签成功');
                } else {
                    await addTagDataAPI(values);
                    message.success('🎉 新增标签成功');
                }

                await getTagList();
                form.resetFields();
                form.setFieldsValue({ name: '' })
                setTag({} as Tag);
            });
        } catch (error) {
            setLoading(false);
            setBtnLoading(false);
        }

        setBtnLoading(false);
    };

    return (
        <div>
            <Title value="标签管理" />

            <div className='flex md:justify-between flex-col md:flex-row mx-auto mt-2'>
                <Card className="w-full md:w-[40%] h-[calc(100vh-180px)]">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={tag}
                        onFinish={onSubmit}
                        size='large'
                    >
                        <Form.Item label="标签名称" name="name" rules={[{ required: true, message: '标签名称不能为空' }]}>
                            <Input placeholder="请输入标签名称" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">{tag.id ? '编辑标签' : '新增标签'}</Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card className="w-full md:w-[59%] [&>.ant-card-body]:!p-0 mt-2 md:mt-0">
                    <Table
                        rowKey="id"
                        dataSource={list}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            position: ['bottomCenter'],
                            pageSize: 8
                        }}
                        loading={loading}
                    />
                </Card>
            </div>
        </div>
    );
};

export default TagPage;
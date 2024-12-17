import { useEffect, useState } from 'react';
import { Spin, Form, notification, Input, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Theme } from '@/types/app/project';
import { editConfigDataAPI, getConfigDataAPI } from '@/api/Project';

const RecordTheme = () => {
    const [loading, setLoading] = useState<boolean>(false);
    // const [theme, setTheme] = useState<Theme>({} as Theme);

    const [form] = Form.useForm();

    const getLayoutData = async () => {
        setLoading(true);

        const { data } = await getConfigDataAPI<Theme>("layout");

        // setTheme(data);

        form.setFieldsValue({
            record_name: data.record_name,
            record_info: data.record_info
        });

        setLoading(false);
    };

    useEffect(() => {
        getLayoutData();
    }, []);

    const editThemeData = async (values: { record_name: string, record_info: string }) => {
        setLoading(true);

        await editConfigDataAPI("layout", values);

        notification.success({
            message: '成功',
            description: '🎉 修改主题成功',
        });

        setLoading(false);
    };

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                <h2 className="text-xl pb-4 pl-10">说说配置</h2>

                <div className='w-full lg:w-[500px] md:ml-10'>
                    <Form form={form} onFinish={editThemeData} layout="vertical">
                        <Form.Item name="record_name" label="个人名称">
                            <Input size='large' placeholder="请输入个人名称" />
                        </Form.Item>

                        <Form.Item name="record_info" label="个人介绍">
                            <Input.TextArea
                                size='large'
                                autoSize={{ minRows: 2, maxRows: 4 }}
                                placeholder="请输入个人介绍"
                            />
                        </Form.Item>

                        <Button type="primary" size="large" className="w-full mt-4" htmlType="submit" loading={loading}>修改主题</Button>
                    </Form>
                </div>
            </Spin>
        </>
    );
};

export default RecordTheme;
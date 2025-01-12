import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card, Modal, Transfer, Spin } from 'antd';
import { getRouteListAPI } from '@/api/Route';
import { getRoleListAPI, addRoleDataAPI, editRoleDataAPI, delRoleDataAPI, getRouteListAPI as getRoleRouteListAPI, bindingRouteAPI, getRoleDataAPI } from '@/api/Role';
import { Role } from '@/types/app/role';
import Title from '@/components/Title';
import { ColumnsType } from 'antd/es/table';
import "./index.scss"

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState(false)
    const [editLoading, setEditLoading] = useState<boolean>(false);
    const [bindingLoading, setBindingLoading] = useState<boolean>(false);

    const [form] = Form.useForm();

    const [role, setRole] = useState<Role>({} as Role);
    const [roleList, setRoleList] = useState<Role[]>([]);
    const [routeList, setRouteList] = useState<{ key: number, title: string }[]>([]);
    // 当前角色的路由列表
    const [targetKeys, setTargetKeys] = useState<number[]>([]);

    // 角色权限框
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: ColumnsType<Role> = [
        { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
        { title: '角色名称', dataIndex: 'name', key: 'name' },
        { title: '角色标识', dataIndex: 'mark', key: 'mark' },
        { title: '角色描述', dataIndex: 'description', key: 'description' },
        {
            title: '操作', key: 'action',
            render: (text: string, record: Role) => (
                <>
                    <Button type="primary" onClick={() => bindingRoute(record)}>权限</Button>
                    <Button onClick={() => editRoleData(record)} className="mx-2">修改</Button>
                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delRoleData(record.id!)}>
                        <Button type="primary" danger>删除</Button>
                    </Popconfirm>
                </>
            )
        }
    ];

    // 获取路由列表
    const getRouteList = async () => {
        const { data } = await getRouteListAPI();
        setRouteList(data.map(item => ({ key: item.id, title: item.description })) as { key: number, title: string }[]);
    };

    // 获取角色列表
    const getRoleList = async () => {
        try {
            const { data } = await getRoleListAPI();
            setRoleList(data as Role[]);
        } catch (error) {
            setLoading(false);
        }

        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getRoleList()
        getRouteList()
    }, []);

    // 获取指定角色的路由列表
    const bindingRoute = async (record: Role) => {
        setEditLoading(true)
        
        try {
            setIsModalOpen(true)
            const { data } = await getRoleRouteListAPI(record.id);
            setTargetKeys(data.map(item => item.id) as number[])
        } catch (error) {
            setEditLoading(false)
        }

        setEditLoading(false)
    }

    const editRoleData = async (record: Role) => {
        setEditLoading(true);

        try {
            const { data } = await getRoleDataAPI(record.id);
            setRole(data);
            form.setFieldsValue(data);
        } catch (error) {
            setEditLoading(false);
        }

        setEditLoading(false);
    };

    const delRoleData = async (id: number) => {
        setLoading(true);

        try {
            await delRoleDataAPI(id);
            await getRoleList();
            message.success('🎉 删除角色成功');
        } catch (error) {
            setLoading(false);
        }
    };

    const onSubmit = async () => {
        setBtnLoading(true)

        try {
            form.validateFields().then(async (values: Role) => {
                if (role.id) {
                    await editRoleDataAPI({ ...role, ...values });
                    message.success('🎉 编辑角色成功');
                } else {
                    await addRoleDataAPI(values);
                    message.success('🎉 新增角色成功');
                }

                await getRoleList();
                form.resetFields();
                form.setFieldsValue({ name: '', description: '' })
                setRole({} as Role);
            });
        } catch (error) {
            setBtnLoading(false)
        }

        setBtnLoading(false)
    };

    // 设置目标路由
    const onChange: any = (list: number[]) => setTargetKeys(list);

    // 绑定路由
    const onBindingRouteSubmit = async () => {
        setBindingLoading(true);

        try {
            await bindingRouteAPI(role.id, targetKeys)
            message.success('🎉 绑定成功');
            // 刷新页面
            window.location.reload()
        } catch (error) {
            setBindingLoading(false);
        }
    }

    // 让n改变 触发Transfer重新渲染
    const [n, setN] = useState(0)

    return (
        <div>
            <Title value="角色管理" />

            <div className='flex md:justify-between flex-col md:flex-row mx-auto mt-2 min-h-[calc(100vh-180px)]'>
                <Card className="w-full md:w-[40%] h-94">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={role}
                        onFinish={onSubmit}
                        size='large'

                    >
                        <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '角色名称不能为空' }]}>
                            <Input placeholder="请输入角色名称" />
                        </Form.Item>

                        <Form.Item label="角色标识" name="mark" rules={[{ required: true, message: '角色标识不能为空' }]}>
                            <Input placeholder="请输入角色标识" />
                        </Form.Item>

                        <Form.Item label="角色描述" name="description" rules={[{ required: true, message: '角色描述不能为空' }]}>
                            <Input placeholder="请输入角色描述" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">{role.id ? '编辑角色' : '新增角色'}</Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card className="w-full md:w-[59%] mt-2 md:mt-0 [&>.ant-card-body]:!p-0">
                    <Table
                        rowKey="id"
                        dataSource={roleList}
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

            <Modal loading={editLoading} title="角色权限" open={isModalOpen} onCancel={() => [setIsModalOpen(false), setN(n + 1)]} footer={null} className='RolePageModal'>
                <div className='flex justify-center py-6'>
                    <Spin spinning={bindingLoading}>
                        <Transfer
                            key={n}
                            dataSource={routeList}
                            targetKeys={targetKeys}
                            titles={['权限列表', '当前权限']}
                            render={(item) => item.title}
                            onChange={onChange}
                            showSelectAll={false}
                        />
                    </Spin>
                </div>

                <Button type='primary' className='w-full mt-2' loading={bindingLoading} onClick={onBindingRouteSubmit}>保存</Button>
            </Modal>
        </div>
    );
};
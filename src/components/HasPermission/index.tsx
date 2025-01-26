import { getPermissionListAPI } from "@/api/Permission";
import { Permission } from "@/types/app/permission";
import { useEffect, useState } from "react";

interface Props {
    code: string;
    children: React.ReactNode;
}

export default ({ code, children }: Props) => {
    const [permissionList, setPermissionList] = useState<Permission[]>([]);
    
    // 获取权限列表
    const getPermissionList = async () => {
        const { data } = await getPermissionListAPI();
        setPermissionList(data);
    };

    useEffect(() => {
        getPermissionList();
    }, []);

    // 判断有没有这个权限
    const hasPermission = permissionList.some(permission => permission.name === code);

    return hasPermission ? children : null;
}
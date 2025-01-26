import { Permission } from "@/types/app/permission";

// 判断是否有权限
export const useHasPermission = (code: string) => {
    const permission = JSON.parse(localStorage.getItem('user_storage') || '{}')?.state?.permission;
    return permission?.some((permission: Permission) => permission.name === code);
}

export default {
    article: {
        del: useHasPermission('article:del'),
        edit: useHasPermission('article:edit'),
    }
}
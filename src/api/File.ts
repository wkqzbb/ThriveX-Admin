import Request from '@/utils/request'
import { File, FileDir } from '@/types/app/file'

// 删除文件
export const delFileDataAPI = (filePath: string) => Request<File>("DELETE", `/file/plus?filePath=${filePath}`)

// 获取文件
export const getFileDataAPI = (filePath: string) => Request<File>("GET", `/file/plus/info?filePath=${filePath}`)

// 获取文件列表
export const getFileListAPI = (dir: string) => Request<File[]>("GET", `/file/plus/list?dir=${dir}`)

// 获取目录列表
export const getDirListAPI = () => Request<FileDir[]>("GET", '/file/plus/dir')
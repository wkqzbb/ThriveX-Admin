import { useUserStore } from '@/stores';
import { FaDownload } from "react-icons/fa6";
import useVersionData from '@/hooks/useVersionData';


const HeaderInfo = () => {
    const { user } = useUserStore();

    const version = useVersionData();

    return (
        <div className="flex justify-between items-center xs:px-6 container mx-auto">
            <div className='flex items-center'>
                {/* 头像 */}
                <img
                    src={user?.avatar || 'https://q1.qlogo.cn/g?b=qq&nk=3311118881&s=640'} alt="avatar"
                    className="w-16 xs:w-24 h-16 xs:h-24 rounded-full mr-4 transition-transform duration-300 transform hover:scale-125 avatar-animation"
                />

                {/* 信息 */}
                <div className="info">
                    <div className="font-medium text-gradient">
                        <div className='text-2xl'>Hello <span className='pr-4'>{user?.name || '未命名'}!</span></div>
                        <div className='text-base xsm:text-lg xs:mt-2.5'>欢迎使用 ThriveX 现代化博客管理系统</div>
                    </div>
                </div>
            </div>

            {/* 项目版本号 */}
            <div className='hidden md:flex md:flex-col space-y-1 xl:mr-30'>
                <div className='flex space-x-4'>
                    <p>当前版本：<b className='inline-block px-2 text-white bg-blue-400 rounded-md'>{import.meta.env.VITE_VERSION}</b></p>
                    <p>最新版本：<b className='inline-block px-2 text-white bg-red-500 rounded-md'>{version.tag_name}</b></p>
                </div>

                <p>更新说明：{version.name}</p>

                <div className='group flex items-center'>
                    <FaDownload className='group-hover:text-primary transition-colors' />
                    <a href={version.tarball_url} className='group-hover:text-primary pl-2 transition-colors'>点击下载最新版</a>
                </div>
            </div>
        </div>
    );
};

export default HeaderInfo;

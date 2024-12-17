import { useState } from 'react';
import { Segmented } from 'antd';
import SynthesisTheme from './components/SynthesisTheme';
import RecordTheme from './components/RecordTheme';

const ThemePage = () => {
    const [current, setCurrent] = useState<string>("综合配置");

    return (
        <>
            <Segmented<string>
                size="large"
                options={['综合配置', '说说配置']}
                onChange={setCurrent}
                className='md:ml-10 mb-4'
            />

            {current === "综合配置" && (
                <SynthesisTheme />
            )}

            {current === "说说配置" && (
                <RecordTheme />
            )}
        </>
    );
};

export default ThemePage;
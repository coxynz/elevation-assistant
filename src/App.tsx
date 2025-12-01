import React, { useState } from 'react';
import StandardApp from './StandardApp';
import VideoWallApp from './videowall/VideoWallApp';
import { SplashScreen } from './SplashScreen';

type AppMode = 'splash' | 'standard' | 'videowall';

const App = () => {
    const [mode, setMode] = useState<AppMode>('splash');

    const handleModeSelect = (selectedMode: 'standard' | 'videowall') => {
        setMode(selectedMode);
    };

    const handleBackToSplash = () => {
        setMode('splash');
    };

    // We can inject a "Back to Home" button into the apps if needed, 
    // or just wrap them in a layout that provides it.
    // For now, let's render them directly. 
    // Ideally, we should pass a "onBack" prop to them, but that requires modifying them.
    // Let's wrap them in a relative container and add a floating "Home" button for now,
    // or just let the user refresh to go back (MVP).
    // Better: Add a small absolute positioned button in the corner to go back.

    const renderContent = () => {
        switch (mode) {
            case 'standard':
                return <StandardApp onSwitchMode={handleBackToSplash} />;
            case 'videowall':
                return <VideoWallApp onSwitchMode={handleBackToSplash} />;
            default:
                return <SplashScreen onSelectMode={handleModeSelect} />;
        }
    };

    return (
        <div className="relative w-full h-full">
            {renderContent()}
        </div>
    );
};

export default App;

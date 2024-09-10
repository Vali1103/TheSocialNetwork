// Sidebar.tsx
import { FC, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import menuIcon from "../assets/menu.png";
import lockIcon from "../assets/padlock.png";
import settingsIcon from "../assets/setting.png";
import LoginFields from './LoginFields';

import iconClose from "./assets/closeSide.png";
import { Box } from "@mui/material";



type IconProps = {
    src: string;
    alt: string;
}

const Icon: FC<IconProps> = ({ src, alt }) => (
    <img src={src} alt={alt} className="icon-image" />
);

const tabs = [
    { name: "Menu", icon: menuIcon },
    { name: "Lock", icon: lockIcon },
    { name: "Settings", icon: settingsIcon }
];

type ButtonProps = {
    name: string;
    icon?: string;
};

const NavButton: FC<ButtonProps> = ({ name, icon }) => (
    <button type="button">
        {icon && <Icon src={icon} alt={name} />}
        <span>{name}</span>
    </button>
);

type TabProps = {
    children: ReactNode;
    isActive: boolean;
}

const Tab: FC<TabProps> = ({ children, isActive }) => (
    <div className={isActive ? "active" : ""}>
        {children}
    </div>
);

type HeaderProps = {
    activeTab: number;
    onTabClicked: (tab: number) => void;
}

const NavHeader: FC<HeaderProps> = ({ activeTab, onTabClicked }) => (
    <header className="sidebar-header">
        {tabs.map((tab, index) => (
            <button
                key={tab.name}
                type="button"
                onClick={() => onTabClicked(index)}
                className={`${activeTab === index ? "active" : ""}`}
            >
                <Icon src={tab.icon} alt={tab.name} />
            </button>
        ))}
        <div
            className="underline"
            style={{
                transform: `translateX(${activeTab * 100}%)`,
            }}
        />
    </header>
);

type SidebarProps = {
    closeSidebar: () => void;
};

export const Sidebar: FC<SidebarProps> = ({ closeSidebar }) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleTabClicked = (tab: number) => {
        setActiveTab(tab);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle("dark-mode", !isDarkMode);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <Box sx={{top:20, zIndex:9999,   left: 0}} height="100%" >

            <div >
                <NavHeader
                    activeTab={activeTab}
                    onTabClicked={handleTabClicked}
                />
                <div className="tabs">
                    <Tab isActive={activeTab === 0}>
                        {/* Content for menu */}
                        Menu Content
                        <button
                            style={{
                                position: 'fixed',
                                top: '675px',
                                left: '70px',
                                border: 'none',
                                background: '#003366',
                                cursor: 'pointer',
                                padding: '5px',
                                width: '120px',
                                height: '30px',
                                fontSize: '14px'
                            }}
                            onClick={closeSidebar} // Utilizați funcția de închidere pentru a închide sidebar-ul
                        >
                            CLOSE <img src={iconClose} alt="Navigation Icon" style={{ width: '10px', height: '10px' }} />
                        </button>
                    </Tab>
                    <Tab isActive={activeTab === 1}>
                        <LoginFields /> {/* Content for lock */}
                    </Tab>
                    <Tab isActive={activeTab === 2}>
                        {/* Content for settings */}
                        <div className="settings-content">
                            <div className="dark-mode-toggle">
                                <span>Dark Mode</span>
                                <button className={`toggle-button ${isDarkMode ? 'on' : 'off'}`} onClick={toggleDarkMode}>
                                    <div className="toggle-knob"></div>
                                </button>
                            </div>
                            <button className="logout-button"
                                    onClick={handleLogout}
                                    style={{
                                        position: 'fixed',
                                        top: '675px',
                                        left: '70px',
                                        border: 'none',
                                        background: '#003366',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        width: '120px',
                                        height: '30px',
                                        fontSize: '14px'
                                    }}
                                    >Log Out</button>
                        </div>
                    </Tab>
                </div>
            </div>
        </Box>
    );
};
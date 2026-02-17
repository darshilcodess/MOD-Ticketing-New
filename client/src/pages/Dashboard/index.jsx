import React from 'react';
import { useAuth } from '../../context/AuthContext';
import UnitDashboard from './UnitDashboard';
import G1Dashboard from './G1Dashboard';
import TeamDashboard from './TeamDashboard';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();

    const renderDashboard = () => {
        switch (user?.role) {
            case 'UNIT': return <UnitDashboard />;
            case 'G1': return <G1Dashboard />;
            case 'TEAM': return <TeamDashboard />;
            default: return <div className="text-red-500">Unknown Role</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <div className="text-sm text-muted-foreground">
                    Current View: <span className="text-[#FF9933] font-medium">{user?.role}</span>
                </div>
            </div>

            {renderDashboard()}
        </motion.div>
    );
}

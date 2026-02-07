// Modular Geometry Container - Manages all dynamic 3D attachments
import { useStore } from '@/store/useStore';
import { ShieldRing } from './ShieldRings';
import { CoolingVents } from './CoolingVents';
import { EmergencyVents } from './EmergencyVents';

export const ModularGeometry = () => {
    const { shieldRings, coolingVentsActive, emergencyVentsActive } = useStore(
        state => state.modularGeometry
    );

    const ringRadii = [2.8, 3.3, 3.8]; // Increasing radii for each ring

    return (
        <group>
            {/* Shield Rings - unlock at 7, 14, 21 day streaks */}
            {Array.from({ length: shieldRings }).map((_, i) => (
                <ShieldRing key={i} index={i} radius={ringRadii[i]} />
            ))}

            {/* Cooling Vents - active when stability 50-79% */}
            {coolingVentsActive && <CoolingVents />}

            {/* Emergency Vents - active when stability < 20% */}
            {emergencyVentsActive && <EmergencyVents />}
        </group>
    );
};

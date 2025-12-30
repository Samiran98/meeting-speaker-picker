import React from 'react';

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#EF476F', '#06A77D'
];

type Props = {
    members: string[];
    disabledMembers: string[];
};

const Wheel: React.FC<Props> = ({ members, disabledMembers }) => {
    if (members.length === 0) return null;

    const segmentAngle = 360 / members.length;
    const radius = 280; // Slightly smaller for better fit

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 560 560"
            className="animate-in fade-in duration-500 aspect-square"
            preserveAspectRatio="xMidYMid meet"
            style={{ background: 'transparent' }}
        >
            <defs>
                <linearGradient id="segmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                </linearGradient>
                <linearGradient id="disabledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(107, 114, 128, 0.3)" />
                    <stop offset="100%" stopColor="rgba(75, 85, 99, 0.2)" />
                </linearGradient>
                <radialGradient id="centerBgGradient" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                </radialGradient>
                <radialGradient id="centerInnerGradient" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                </radialGradient>
                <filter id="centerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g transform="translate(280, 280)">
                {members.map((member, index) => {
                    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

                    const x1 = radius * Math.cos(startAngle);
                    const y1 = radius * Math.sin(startAngle);
                    const x2 = radius * Math.cos(endAngle);
                    const y2 = radius * Math.sin(endAngle);

                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                    const textAngle = startAngle + (endAngle - startAngle) / 2;
                    const textRadius = radius * 0.75;
                    const textX = textRadius * Math.cos(textAngle);
                    const textY = textRadius * Math.sin(textAngle);
                    const textRotation = ((index * segmentAngle + segmentAngle / 2) + 90) % 360;

                    const isDisabled = disabledMembers.includes(member);

                    return (
                        <g key={index}>
                            {members.length === 1 ? (
                                // For single member, draw a full circle
                                <circle
                                    cx="0"
                                    cy="0"
                                    r={radius}
                                    fill={isDisabled ? '#9CA3AF' : colors[index % colors.length]}
                                    stroke={isDisabled ? '#6B7280' : 'white'}
                                    strokeWidth={isDisabled ? '3' : '2'}
                                    opacity={isDisabled ? 0.7 : 1}
                                    className="transition-all duration-300"
                                />
                            ) : (
                                // For multiple members, draw the segment path
                                <>
                                    <path
                                        d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={isDisabled ? '#9CA3AF' : colors[index % colors.length]}
                                        stroke={isDisabled ? '#6B7280' : 'white'}
                                        strokeWidth={isDisabled ? '3' : '2'}
                                        opacity={isDisabled ? 0.7 : 1}
                                        className="transition-all duration-300 hover:opacity-90"
                                    />
                                    <path
                                        d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={isDisabled ? 'url(#disabledGradient)' : 'url(#segmentGradient)'}
                                        opacity={isDisabled ? 0.4 : 0.3}
                                        className="transition-all duration-300"
                                    />
                                </>
                            )}



                            <text
                                x={textX}
                                y={textY}
                                fill={isDisabled ? '#374151' : 'white'}
                                fontSize="20"
                                fontWeight={isDisabled ? '500' : '600'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                opacity={isDisabled ? 0.8 : 1}
                                textDecoration={isDisabled ? 'line-through' : 'none'}
                                style={{ textShadow: isDisabled ? 'none' : '0 2px 4px rgba(0,0,0,0.5)' }}
                            >
                                {member}
                            </text>
                        </g>
                    );
                })}



                {/* Outer ring */}
                <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

                {/* Middle ring */}
                <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                {/* Main center circle */}
                <circle cx="0" cy="0" r="24" fill="url(#centerBgGradient)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" filter="url(#centerGlow)" />

                {/* Inner accent circle */}
                <circle cx="0" cy="0" r="16" fill="url(#centerInnerGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

                {/* Microphone icon */}
                <g transform="translate(-6, -8)">
                    <circle cx="6" cy="6" r="2.5" fill="white" opacity="0.9" />
                    <rect x="5" y="8.5" width="2" height="6" rx="1" fill="white" opacity="0.9" />
                    <rect x="3.5" y="14" width="5" height="2" rx="1" fill="white" opacity="0.9" />
                    <circle cx="6" cy="17" r="1" fill="white" opacity="0.9" />
                </g>
            </g>
        </svg>
    );
};

export default Wheel;

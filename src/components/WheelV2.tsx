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
    const radius = 150;

    return (
        <svg width="320" height="320" viewBox="0 0 320 320">
            <g transform="translate(160, 160)">
                {members.map((member, index) => {
                    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

                    const x1 = radius * Math.cos(startAngle);
                    const y1 = radius * Math.sin(startAngle);
                    const x2 = radius * Math.cos(endAngle);
                    const y2 = radius * Math.sin(endAngle);

                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                    const textAngle = startAngle + (endAngle - startAngle) / 2;
                    const textRadius = radius * 0.7;
                    const textX = textRadius * Math.cos(textAngle);
                    const textY = textRadius * Math.sin(textAngle);
                    const textRotation = ((index * segmentAngle + segmentAngle / 2) + 90) % 360;

                    const isDisabled = disabledMembers.includes(member);

                    return (
                        <g key={index}>
                            <path
                                d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={isDisabled ? '#d1d5db' : colors[index % colors.length]}
                                stroke="white"
                                strokeWidth="2"
                                opacity={isDisabled ? 0.5 : 1}
                            />
                            <text
                                x={textX}
                                y={textY}
                                fill="white"
                                fontSize="14"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                opacity={isDisabled ? 0.6 : 1}
                                textDecoration={isDisabled ? 'line-through' : 'none'}
                            >
                                {member}
                            </text>
                        </g>
                    );
                })}

                {/* Center circle with image */}
                <circle cx="0" cy="0" r="75" fill="white" stroke="#333" strokeWidth="3" />

                {/* Clip path for circular image */}
                <defs>
                    <clipPath id="circle-clip">
                        <circle cx="0" cy="0" r="75" />
                    </clipPath>
                </defs>

                {/* Center image - replace the href with your image URL */}
                <image
                    href="/public/2025-11-07_12-11.png"
                    x="-100"
                    y="-100"
                    width="200"
                    height="200"
                    clipPath="url(#circle-clip)"
                />

                {/* <circle cx="0" cy="0" r="10" fill="#333" /> */}
            </g>
        </svg>

    );
};

export default Wheel;

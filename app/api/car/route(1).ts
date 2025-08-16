import { NextResponse } from 'next/server';

// 模擬的車輛資料庫
const cars = [
    {
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: '珍珠白',
        price: 950000,
        features: ['油耗經濟', '空間寬敞', '安全性高'],
        image: 'https://picsum.photos/seed/toyota123/400/300'
    },
    {
        id: 2,
        brand: 'Honda',
        model: 'CR-V',
        year: 2023,
        color: '星空藍',
        price: 1150000,
        features: ['越野性能優異', '智慧駕駛輔助', '大容量後車廂'],
        image: 'https://picsum.photos/seed/honda456/400/300'
    },
    {
        id: 3,
        brand: 'Lexus',
        model: 'ES',
        year: 2023,
        color: '曜石黑',
        price: 1850000,
        features: ['豪華內裝', '靜音技術', '優異操控性'],
        image: 'https://picsum.photos/seed/lexus789/400/300'
    }
];

export async function GET() {
    return NextResponse.json(cars);
}

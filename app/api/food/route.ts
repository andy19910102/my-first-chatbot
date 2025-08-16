import { NextResponse } from 'next/server';

const foods = [
    {
        id: 1,
        name: '日式拉麵',
        price: 180,
        category: '麵食',
        description: '濃郁豚骨湯頭，配上完美半熟蛋',
        ingredients: ['豚骨湯', '叉燒', '溏心蛋', '筍乾', '蔥花'],
        calories: 650,
        spicyLevel: 1,
        image: 'https://picsum.photos/seed/ramen123/400/300'
    },
    {
        id: 2,
        name: '美式漢堡',
        price: 150,
        category: '速食',
        description: '雙層純牛肉排加上特製醬料',
        ingredients: ['牛肉排', '生菜', '番茄', '起司', '漢堡醬'],
        calories: 850,
        spicyLevel: 0,
        image: 'https://picsum.photos/seed/burger456/400/300'
    },
    {
        id: 3,
        name: '泰式打拋雞飯',
        price: 160,
        category: '飯食',
        description: '香辣夠味的打拋雞肉配上香噴噴的泰國香米',
        ingredients: ['雞肉', '蒜', '辣椒', '九層塔', '魚露'],
        calories: 580,
        spicyLevel: 3,
        image: 'https://picsum.photos/seed/thaifood789/400/300'
    },
    {
        id: 4,
        name: '義大利海鮮麵',
        price: 220,
        category: '麵食',
        description: '新鮮海鮮搭配手工製作的義大利麵',
        ingredients: ['蝦子', '蛤蜊', '魷魚', '蒜末', '白酒'],
        calories: 520,
        spicyLevel: 0,
        image: 'https://picsum.photos/seed/pasta101/400/300'
    },
    {
        id: 5,
        name: '麻婆豆腐',
        price: 140,
        category: '中式',
        description: '道地四川麻婆豆腐，香辣過癮',
        ingredients: ['豆腐', '豬絞肉', '豆瓣醬', '花椒', '蔥花'],
        calories: 450,
        spicyLevel: 4,
        image: 'https://picsum.photos/seed/mapo202/400/300'
    }
];

export async function GET() {
    return NextResponse.json(foods);
}

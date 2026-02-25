/**
 * Lightweight Traditional → Simplified Chinese converter for place names.
 * Covers common administrative and geographic characters that often appear
 * in city/county/district names returned by map APIs.
 */
const T2S_MAP: Record<string, string> = {
    '縣': '县', '鎮': '镇', '鄉': '乡', '區': '区', '龍': '龙',
    '東': '东', '嶺': '岭', '橋': '桥', '灣': '湾', '島': '岛',
    '寧': '宁', '興': '兴', '廣': '广', '萬': '万', '義': '义',
    '華': '华', '陽': '阳', '雲': '云', '貴': '贵', '蘭': '兰',
    '賓': '宾', '麗': '丽', '紅': '红', '綠': '绿', '潔': '洁',
    '遠': '远', '聖': '圣', '鳳': '凤', '鵝': '鹅', '鶴': '鹤',
    '鴨': '鸭', '鷺': '鹭', '馬': '马', '駱': '骆', '驛': '驿',
    '實': '实', '銀': '银', '銅': '铜', '鐵': '铁', '鋼': '钢',
    '開': '开', '關': '关', '長': '长', '強': '强', '韶': '韶',
    '嗎': '吗', '們': '们', '愛': '爱', '務': '务', '請': '请',
    '這': '这', '個': '个', '對': '对', '說': '说', '時': '时',
    '發': '发', '國': '国', '舊': '旧', '鐘': '钟', '陸': '陆',
    '邊': '边', '過': '过', '話': '话', '還': '还', '兩': '两',
    '應': '应', '問': '问', '後': '后', '給': '给', '總': '总',
    '當': '当', '動': '动', '學': '学', '來': '来', '現': '现',
};

export function toSimplified(str: string): string {
    if (!str) return str;
    return str.split('').map(ch => T2S_MAP[ch] ?? ch).join('');
}

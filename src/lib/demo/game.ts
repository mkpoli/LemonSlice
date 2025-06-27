/**
 * Game utilities for replay files
 * Based on the Python implementation in game.py
 */

/**
 * Map ID to display name mapping
 */
export const MAP_ID_MAP: Record<string, string> = {
	// Demolition maps
	Envi_Umeda: 'Area 88', // 梅田 (Umeda station in Osaka, Japan)
	Envi_Olgk: 'Port Euler', // 欧拉港口 Ōulāgǎngkǒu
	Envi_Fyz: 'Windy Town', // 风曳镇 Fēngyèzhèn
	Envi_FZFBase: 'Base 404', // FZF + Base (Chinese initials + Base)
	Envi_Htbwg: 'Space Lab', // 航天博物馆 Hángtiān Bówùguǎn (Space Museum)
	Envi_Kxjq: 'Cauchy Street',
	Envi_Ksmt: 'Cosmite', // 科斯迷特 Kēsīmítè (Khesmet)
	Envi_Akns: 'Ocarnus', // 奧卡努斯 Àokǎnǔsī (Orcanus)
	// Escort maps
	Envi_Tct1: 'Departure Zone', // 推车图 tuī chē tú（push car map）1
	Envi_Watchpoint: 'Jaksaa Factory', // Watchpoint: Gibraltar reference
	Envi_Tct3: 'Snowveil District', // 推车图 tuī chē tú（push car map）3
	Envi_Tct4: 'Tyve Oasis', // 推车图 tuī chē tú（push car map）4
	// Infection maps
	Envi_SilentCountry: 'Loch District', // 寂静村 (Silent Hill reference)
	Envi_Wind: 'Ghannak', // Wind reference
	Envi_Jdhcz: 'Polar Research Institute', // 极地？？？（合成站？）
	// Team Arena maps
	Envi_Ltyq: 'Wright Campus', // 莱特园区 lái tè yuán qū
	Envi_Iceworld: 'No. 2 Depot', // fy_iceworld reference
	Envi_Ice: 'No. 2 Depot', // Alternative name for iceworld
	Envi_BloodStrike: 'Blossom Dojo', // cs_bloodstrike reference
	Envi_Dirac: 'District Arcadia', // District Arcadia / Dirac Mine
	Envi_TM8: 'Power Plant', // Teamate reference
	Envi_Wharf: 'Pier Town', // Wharf
	Envi_Yxz: 'District Arcadia', // 游戏？ (Yxz = initials)
	// Train maps
	Envi_Train: 'Range', // Range
	// Unconfirmed maps (keeping original IDs as placeholders)
	Envi_Nys: 'Unknown Map (Nys)', // 纽？市 (New? City)
	Envi_Qydx: 'Unknown Map (Qydx)', // q y d x？？
	Envi_Tct: 'Unknown Map (Tct)',
	Envi_Tct2: 'Unknown Map (Tct2)',
	Envi_ZGYJ: 'Unknown Map (ZGYJ)', // ？？遗迹
	Envi_Wlbl: 'Unknown Map (Wlbl)',
	// Debug maps
	BombMatch: 'Debug: BombMatch',
	EmptyScene: 'Debug: EmptyScene',
	Escort: 'Debug: Escort',
	Splatoon: 'Debug: Splatoon',
	Toon: 'Debug: Toon',
	Zombie: 'Debug: Zombie',
	// Scenario maps
	JQ_Envi_Central: 'Scenario: Central',
	JQ_Envi_Hongta: 'Scenario: Hongta',
	JQ_Envi_laboratory: 'Scenario: Laboratory',
	JQ_Envi_Reward: 'Scenario: Reward',
	JQ_Envi_Umeda: 'Scenario: Umeda'
};

/**
 * Get the display name for a map ID
 */
export function getMapDisplayName(mapId: string): string {
	return MAP_ID_MAP[mapId] || mapId;
}

/**
 * Extract map name from a map path
 */
export function extractMapName(mapPath: string): string {
	// Extract the last part of the path (after the last slash)
	const parts = mapPath.split('/');
	const mapId = parts[parts.length - 1];
	return getMapDisplayName(mapId);
}

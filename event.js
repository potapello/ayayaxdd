var SUPABASE_URL = null;
var SUPABASE_ANON_KEY = null;

// Запрос 1: Получение всех игроков через GET-запрос
async function fetchLeaderboardDirect() {
	if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {console.error('No event! (leaderboard)'); return};

  	const response = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id,player_name,score,avatar_url,last_update,data&order=score.desc`, {
  	  	headers: {
  	  	  	'apikey': SUPABASE_ANON_KEY,
  	  	  	'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  	  	}
  	});

  	if (!response.ok) {
  	  	console.error('Ошибка при получении данных:', await response.text())
  	  	return []
  	};

  	const data = await response.json()
  	return data
};

// Запрос 2: Обновление игрока через POST-запрос к RPC-функции
async function updatePlayerDirect(key, score, avatarUrl = null, customData = null) {
	if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {console.error('No event! (update)'); return};

  	const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_player_data`, {
  	  	method: 'POST',
  	  	headers: {
  	  	  	'apikey': SUPABASE_ANON_KEY,
  	  	  	'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  	  	  	'Content-Type': 'application/json',
  	  	  	'Prefer': 'return=representation' // просим вернуть результат
  	  	},
  	  	body: JSON.stringify({
  	  	  	p_player_key: key,
  	  	  	p_score: score,
  	  	  	p_avatar_url: avatarUrl,
  	  	  	p_data: customData
  	  	})
  	});

  	if (!response.ok) {
  	  	const errorMsg = await response.text()
  	  	console.error('Ошибка обновления:', errorMsg)
  	} else {
  	 	// const data = await response.json()
  	 	// console.log('Успешно обновлено:', data)
  	}
};
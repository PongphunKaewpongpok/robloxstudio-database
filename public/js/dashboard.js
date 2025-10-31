let players = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/players")
    .then(response => response.json())
    .then(json => {
      const player_data = json.players || [];
      players = player_data
      console.log(players);

      renderPlayerList();
    })
    .catch(err => console.error("Failed to load players:", err));


  
  const currentService = window.location.pathname.split("/").pop();

  const logTypeList = document.getElementById('log-type-list');
  const newLogTypeInput = document.getElementById('new-log-type');
  const addLogTypeButton = document.getElementById('add-log-type');

  



  const playerListEl = document.getElementById('player-list');
  const searchInput = document.getElementById('search-player');
  const selectedUsernameEl = document.getElementById('profile-username');
  const playerJsonEl = document.getElementById('player-json');
  const saveBtn = document.getElementById('save-btn');
  const tokenInput = document.getElementById("player-token");
  const generateBtn = document.getElementById("generate-token");
  const copyBtn = document.getElementById("copy-token");
  let currentPlayerIndex = null;

  async function fetchPlayerAvatar(userId) {
    try {
      const response = await fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
      const data = await response.json();
      if (data?.data?.[0]?.imageUrl) return data.data[0].imageUrl;
    } catch (err) {
      console.error("Failed to fetch avatar:", err);
    }
    return '/images/everyone-avatar.jpg';
  }

  function renderPlayerList(filter = '') {
    if (!playerListEl) return;
    playerListEl.innerHTML = '';

    const everyoneLi = document.createElement('li');
    everyoneLi.textContent = '@everyone';
    everyoneLi.style.fontWeight = 'bold';
    everyoneLi.style.color = '#ffd700';
    everyoneLi.onclick = () => selectPlayer('everyone');
    playerListEl.appendChild(everyoneLi);

    const search = filter.toLowerCase();

    players.forEach((player, index) => {
      // ตรวจสอบทั้ง username และ UserId (เป็น string)
      const matchUsername = player.username?.toLowerCase().includes(search);
      const matchUserId = String(player.UserId || '').includes(search);

      if (matchUsername || matchUserId) {
        const li = document.createElement('li');
        li.textContent = `${player.username} (${player.UserId})`;
        li.onclick = () => selectPlayer(index);
        playerListEl.appendChild(li);
      }
    });
  }

  async function selectPlayer(index) {
    currentPlayerIndex = index;

    if (!selectedUsernameEl || !playerJsonEl) return;

    if (index === 'everyone') {
      selectedUsernameEl.textContent = '@everyone';
      playerJsonEl.value = JSON.stringify(players[0].data, null, 2);
      const imgEl = document.getElementById('profile-img');
      if (imgEl) imgEl.src = '/images/everyone-avatar.jpg';
      const coinsEl = document.getElementById('profile-coins');
      if (coinsEl) coinsEl.textContent = 'Coins: -';
      const scoreEl = document.getElementById('profile-score');
      if (scoreEl) scoreEl.textContent = 'Score: -';
    } else {
      const player = players[index];
      selectedUsernameEl.textContent = player.username + ` (${player.UserId})`;
      playerJsonEl.value = JSON.stringify(player.data, null, 2);
      const coinsEl = document.getElementById('profile-coins');
      if (coinsEl) coinsEl.textContent = `Coins: ${player.data.coins ?? '-'}`;
      const scoreEl = document.getElementById('profile-score');
      if (scoreEl) scoreEl.textContent = `Score: ${player.data.score ?? '-'}`;
      const imgEl = document.getElementById('profile-img');
      if (imgEl) imgEl.src = await fetchPlayerAvatar(player.UserId);
    }

    if (playerJsonEl) playerJsonEl.removeAttribute('readonly');
    if (saveBtn) saveBtn.removeAttribute('disabled');

    const container = document.getElementById('player-json-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (currentPlayerIndex === null) return;
      try {
        const updatedData = JSON.parse(playerJsonEl.value);

        const response = await fetch('/api/updatePlayerData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerIndex: currentPlayerIndex, updatedData })
        });

        const result = await response.json();
        if (result.success) {
          alert('Player data updated in database!');
          // อัปเดต array client ด้วย
          if (currentPlayerIndex === 'everyone') {
            players.forEach(player => {
              Object.assign(player.data, updatedData);
            });
          } else {
            Object.assign(players[currentPlayerIndex].data, updatedData);
          }
        } else {
          alert(result.message || 'Failed to update!');
        }
      } catch (err) {
        console.error(err);
        alert('Invalid JSON format or server error!');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => renderPlayerList(searchInput.value));
  }

  if (generateBtn && tokenInput) {
    generateBtn.onclick = async () => {
      try {
        const response = await fetch("/api/generateToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (data.status === "success" && data.token) {
          tokenInput.value = data.token;
          alert("New token generated!");
        } else {
          alert("Failed to generate token, try again.");
        }
      } catch (err) {
        console.error("Error generating token:", err);
        alert("Error generating token. Check console.");
      }
    };
  }

  

  if (copyBtn && tokenInput) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(tokenInput.value);
        alert("Token copied!");
      } catch (err) {
        console.error("Failed to copy token:", err);
        alert("Failed to copy token. Please try manually.");
      }
    };
  }

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await fetch("/logout", { method: "POST" });

        localStorage.removeItem("auth_token");
        localStorage.removeItem("username");

        window.location.href = "/login";
    } catch (err) {
        console.error("Logout error:", err);
        alert("Failed to logout. Try again.");
    }
  });


  async function loadLogTypes() {
      logTypeList.innerHTML = '<li>Loading...</li>';
      try {
          const response = await fetch('/api/logtypes');
          const data = await response.json();

          if (data.success) {
              renderLogTypes(data.types);
          } else {
              logTypeList.innerHTML = `<li>Error: ${data.message}</li>`;
          }
      } catch (error) {
          logTypeList.innerHTML = `<li>Failed to fetch log types.</li>`;
          console.error('Fetch error:', error);
      }
  }

  function renderLogTypes(types) {
      if (types.length === 0) {
          logTypeList.innerHTML = '<li>No log types defined.</li>';
          return;
      }
      logTypeList.innerHTML = '';
      
      types.forEach(type => {
          const listItem = document.createElement('li');
          listItem.textContent = type;
          
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Remove';
          deleteButton.className = 'delete-btn';
          deleteButton.onclick = () => removeLogType(type);
          
          listItem.appendChild(deleteButton);
          logTypeList.appendChild(listItem);
      });
  }

  if (logTypeList && newLogTypeInput && addLogTypeButton) {
    addLogTypeButton.addEventListener('click', async () => {
        const newType = newLogTypeInput.value.trim();
        if (!newType) return;

        try {
          const response = await fetch('/api/logtypes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newType })
          });
          const data = await response.json();
          
          if (data.success) {
              newLogTypeInput.value = '';
              await loadLogTypes();
          } else {
              alert(`Failed to add type: ${data.message}`);
          }
        } catch (error) {
            alert('An error occurred while adding the log type.');
            console.error('Add error:', error);
        }
    });
  }
  

  async function removeLogType(typeToRemove) {
      if (!confirm(`Are you sure you want to remove "${typeToRemove}"?`)) return;

      try {
          const response = await fetch('/api/logtypes/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ typeToRemove })
          });
          const data = await response.json();
          
          if (data.success) {
              await loadLogTypes();
          } else {
              alert(`Failed to remove type: ${data.message}`);
          }
      } catch (error) {
          alert('An error occurred while removing the log type.');
          console.error('Remove error:', error);
      }
  }

  function switchService(service) {
    console.log(service)
    const services = ['player', 'analytics', 'settings', 'logs'];
    if (service === 'settings') {
      
      (async () => {
        try {
          const res = await fetch("/api/getToken");
          const data = await res.json();

          if (res.ok && data.success && data.token_id) {
            tokenInput.value = data.token_id;
          } else {
            console.warn("Failed to get token:", data.message);
          }
        } catch (err) {
          console.error("Error fetching token:", err);
        }
      })();
      
      if (logTypeList && newLogTypeInput && addLogTypeButton) {
        loadLogTypes(); 
      }
    }
  }


  renderPlayerList();
  window.switchService = switchService;
  switchService(currentService) 
});

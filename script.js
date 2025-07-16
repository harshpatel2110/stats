document.addEventListener('DOMContentLoaded', function() {
    const teamsTable = document.getElementById('teamsTable');
    const saveBtn = document.getElementById('saveBtn');
    const messageEl = document.getElementById('message');
    
    // Image path configurations
    const IMAGE_PATHS = {
        status: {
            '0': 'C:\\Users\\306th\\Downloads\\TRYING\\all dead.png',
            '1': 'C:\\Users\\306th\\Downloads\\TRYING\\1 alive.png',
            '2': 'C:\\Users\\306th\\Downloads\\TRYING\\2 alive.png',
            '3': 'C:\\Users\\306th\\Downloads\\TRYING\\3 alive.png',
            '4': 'C:\\Users\\306th\\Downloads\\TRYING\\all alive.png',
            '2-1': 'C:\\PRODUCTION\\statssample\\2L 1K.png',
            '3-1': 'C:\\PRODUCTION\\statssample\\3L 1K.png',
            '3-2': 'C:\\PRODUCTION\\statssample\\3L 2K.png',
            '4-1': 'C:\\PRODUCTION\\statssample\\4l 1k.png',
            '4-2': 'C:\\PRODUCTION\\statssample\\4l 2k.png',
            '4-3': 'C:\\PRODUCTION\\statssample\\4l 3k.png'
        },
        eliminated: 'C:\\Users\\306th\\Downloads\\TRYING\\Stats Black.png',
        transparent: 'C:\\Users\\306th\\Downloads\\TRYING\\transparent.png',
        fight: 'C:\\Users\\306th\\Downloads\\ORAIN\\New folder (2)\\fight.png',
        zone: 'C:\\Users\\306th\\Downloads\\ORAIN\\New folder (2)\\zoneout.png',
        dominate: 'C:\\Users\\306th\\Downloads\\ORAIN\\New folder (2)\\dominate.png',
        defaultLogo: 'C:\\Users\\306th\\Downloads\\Gravity Logo.png'
    };

    // Team data
    let teams = [];
    let eliminationOrder = 12;

    // Initialize teams
    function initTeams() {
        teams = [];
        eliminationOrder = 12;
        
        const backendTeamConfig = [
            { name: 'Team 1', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 2', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 3', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 4', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 5', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 6', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 7', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 8', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 9', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 10', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 11', logo: IMAGE_PATHS.defaultLogo },
            { name: 'Team 12', logo: IMAGE_PATHS.defaultLogo }
        ];
        
        for (let i = 0; i < 12; i++) {
            teams.push({
                id: i + 1,
                name: backendTeamConfig[i].name,
                logo: backendTeamConfig[i].logo,
                status: 'alive',
                points: 0,
                kills: 0,
                alivePlayers: 4,
                knockedPlayers: 0,
                isFighting: false,
                isInZone: false,
                eliminationPosition: null,
                eliminationTime: null,
                statusImagePath: '',
                eliminatedImagePath: '',
                fightImagePath: '',
                zoneImagePath: '',
                dominateImagePath: ''
            });
        }
        renderTeams();
    }

    function updateTeamStatus(team) {
        if (team.alivePlayers === 0 && team.status !== 'eliminated') {
            team.status = 'eliminated';
            team.knockedPlayers = 0;
            team.isFighting = false;
            team.isInZone = false;
            if (!team.eliminationPosition) {
                team.eliminationPosition = eliminationOrder--;
                team.eliminationTime = new Date();
            }
            team.statusImagePath = IMAGE_PATHS.status['0'];
            team.eliminatedImagePath = IMAGE_PATHS.eliminated;
            team.dominateImagePath = IMAGE_PATHS.transparent;
        } else if (team.knockedPlayers > 0) {
            team.status = 'knocked';
            team.eliminatedImagePath = IMAGE_PATHS.transparent;
            const statusKey = `${team.alivePlayers}-${team.knockedPlayers}`;
            team.statusImagePath = IMAGE_PATHS.status[statusKey] || IMAGE_PATHS.status[team.alivePlayers];
        } else if (team.status !== 'eliminated') {
            team.status = 'alive';
            team.eliminatedImagePath = IMAGE_PATHS.transparent;
            team.statusImagePath = IMAGE_PATHS.status[team.alivePlayers];
        }

        team.fightImagePath = team.isFighting ? IMAGE_PATHS.fight : IMAGE_PATHS.transparent;
        team.zoneImagePath = team.isInZone ? IMAGE_PATHS.zone : IMAGE_PATHS.transparent;
    }

    function getDominatingTeams() {
        const aliveTeams = teams.filter(t => t.status !== 'eliminated');
        if (aliveTeams.length === 0) return [];
        
        const maxKills = Math.max(...aliveTeams.map(t => t.kills));
        if (maxKills === 0) return [];
        
        return aliveTeams.filter(t => t.kills === maxKills);
    }

    function sortTeamsForCSV(teamsToSort) {
        return [...teamsToSort].sort((a, b) => {
            if (a.status !== 'eliminated' && b.status !== 'eliminated') {
                return b.kills - a.kills;
            }
            
            if (a.status === 'eliminated' && b.status === 'eliminated') {
                return b.eliminationTime - a.eliminationTime;
            }
            
            if (a.status !== 'eliminated') return -1;
            if (b.status !== 'eliminated') return 1;
            
            return 0;
        });
    }

    function renderTeams() {
        const tbody = teamsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        const dominatingTeams = getDominatingTeams();
        teams.forEach(team => {
            updateTeamStatus(team);
            team.dominateImagePath = dominatingTeams.some(t => t.id === team.id) 
                ? IMAGE_PATHS.dominate 
                : IMAGE_PATHS.transparent;
        });

        teams.forEach(team => {
            const row = document.createElement('tr');
            row.className = `team-row ${team.status}`;
            
            row.innerHTML = `
                <td>${team.id}</td>
                <td><img src="${team.logo}" class="team-logo" onerror="this.src='https://via.placeholder.com/30?text=LOGO'"></td>
                <td class="status-cell status-${team.status}">${team.status.toUpperCase()}</td>
                <td>${team.name}</td>
                <td><input type="number" value="${team.points}" data-team="${team.id}" data-type="points"></td>
                <td><input type="number" value="${team.kills}" data-team="${team.id}" data-type="kills"></td>
                <td><input type="number" value="${team.alivePlayers}" min="0" max="4" data-team="${team.id}" data-type="alivePlayers" ${team.status === 'eliminated' ? 'disabled' : ''}></td>
                <td><input type="number" value="${team.knockedPlayers}" min="0" max="4" data-team="${team.id}" data-type="knockedPlayers" ${team.status === 'eliminated' ? 'disabled' : ''}></td>
                <td class="checkbox-cell"><input type="checkbox" ${team.isInZone ? 'checked' : ''} data-team="${team.id}" data-type="isInZone" ${team.status === 'eliminated' ? 'disabled' : ''}></td>
                <td class="checkbox-cell"><input type="checkbox" ${team.isFighting ? 'checked' : ''} data-team="${team.id}" data-type="isFighting" ${team.status === 'eliminated' ? 'disabled' : ''}></td>
            `;
            
            tbody.appendChild(row);
        });

        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', function() {
                const teamId = parseInt(this.getAttribute('data-team'));
                const type = this.getAttribute('data-type');
                let value;
                
                if (this.type === 'checkbox') {
                    value = this.checked;
                } else {
                    value = parseInt(this.value) || 0;
                    if ((type === 'alivePlayers' || type === 'knockedPlayers') && value > 4) {
                        this.value = 4;
                        value = 4;
                    }
                }
                
                updateTeamData(teamId, type, value);
            });
        });
    }

    function updateTeamData(teamId, type, value) {
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex === -1) return;
        
        teams[teamIndex][type] = value;
        updateTeamStatus(teams[teamIndex]);
        renderTeams();
        saveFiles(); // Auto-save on change
    }

    function generateCsvContent() {
        const headers = [
            'Position', 'Team ID', 'Team Name', 'Logo Path', 'Status',
            'Points', 'Kills', 'Alive Players', 'Knocked Players',
            'Is Fighting', 'Fight Image Path',
            'Is In Zone', 'Zone Image Path',
            'Status Image Path', 'Eliminated Image Path',
            'Dominate Image Path', 'Elimination Position', 'Elimination Time'
        ];
        
        const sortedTeams = sortTeamsForCSV(teams);
        
        let aliveTeams = sortedTeams.filter(t => t.status !== 'eliminated');
        aliveTeams.forEach((team, index) => {
            team.tempPosition = index + 1;
        });
        
        return [
            headers.join(','),
            ...sortedTeams.map((team) => {
                const position = team.status !== 'eliminated' ? team.tempPosition : team.eliminationPosition;
                const isDominating = team.dominateImagePath === IMAGE_PATHS.dominate;
                
                return [
                    position,
                    team.id,
                    `"${team.name}"`,
                    `"${team.logo}"`,
                    team.status,
                    team.points,
                    team.kills,
                    team.alivePlayers,
                    team.knockedPlayers,
                    team.isFighting ? 'TRUE' : 'FALSE',
                    `"${team.fightImagePath}"`,
                    team.isInZone ? 'TRUE' : 'FALSE',
                    `"${team.zoneImagePath}"`,
                    `"${team.statusImagePath}"`,
                    `"${team.eliminatedImagePath}"`,
                    isDominating ? `"${IMAGE_PATHS.dominate}"` : `"${IMAGE_PATHS.transparent}"`,
                    team.eliminationPosition || '',
                    team.eliminationTime ? team.eliminationTime.toISOString() : ''
                ].join(',');
            })
        ].join('\n');
    }

    function generateJsonContent() {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            teams: teams.map(team => ({
                id: team.id,
                name: team.name,
                status: team.status,
                points: team.points,
                kills: team.kills,
                alivePlayers: team.alivePlayers,
                knockedPlayers: team.knockedPlayers,
                isFighting: team.isFighting,
                isInZone: team.isInZone,
                eliminationPosition: team.eliminationPosition,
                eliminationTime: team.eliminationTime
            }))
        }, null, 2);
    }

    async function saveFiles() {
        const csvContent = generateCsvContent();
        const jsonContent = generateJsonContent();
        
        try {
            const response = await fetch('http://192.168.1.7:1115/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csvData: csvContent,
                    jsonData: jsonContent
                })
            });
            
            const result = await response.json();
            if (result.success) {
                messageEl.textContent = `Updated at ${new Date().toLocaleTimeString()}`;
                console.log('Files saved to:', result.csvPath, result.jsonPath);
            } else {
                messageEl.textContent = `Error: ${result.error}`;
                console.error('Save failed:', result);
            }
        } catch (error) {
            messageEl.textContent = 'Server connection failed';
            console.error('Network error:', error);
        }
        
        setTimeout(() => messageEl.textContent = '', 3000);
    }

    saveBtn.addEventListener('click', function() {
        saveFiles();
        messageEl.textContent = 'Saving changes...';
    });

    // Initialize everything
    initTeams();
});
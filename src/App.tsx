import { useState } from 'react'
import QRCode from 'react-qr-code'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import PWABadge from './PWABadge.tsx'
import BuildInfo from './BuildInfo.tsx'
import pako from 'pako'
import './App.css'

type Friend = {
  name: string;
  is_in_game: boolean;
};

type GameType = "Avalon" | "Secret Hitler";

const hashCode = (x: string) => {
  let hash = 0, i, chr;
  if (x.length === 0) return hash;
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const splitmix32 = (a: number) => {
  return () => {
    a |= 0;
    a = a + 0x9e3779b9 | 0;
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
};

type Game = {
  roles: string[];
  starter: number;
}


const rolesPerPlayerCountAvalon: { [x: number]: string[] | undefined } = {
  5: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Servant",
  ],
  6: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Servant",
    "Servant",
  ],
  7: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
  ],
  8: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
    "Servant",
  ],
  9: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
    "Servant",
    "Servant",
  ],
  10: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Minion",
    "Servant",
    "Servant",
    "Servant",
    "Servant",
  ],
}

const rolesPerPlayerCountHitler: { [x: number]: string[] | undefined } = {
  5: [
    "Adolf Hitler",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
  6: [
    "Adolf Hitler",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
  7: [
    "Adolf Hitler",
    "Fascist",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
  8: [
    "Adolf Hitler",
    "Fascist",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
  9: [
    "Adolf Hitler",
    "Fascist",
    "Fascist",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
  10: [
    "Adolf Hitler",
    "Fascist",
    "Fascist",
    "Fascist",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal",
    "Liberal"
  ],
}

const bads = ["Mordred", "Morgana", "Assassin", "Minion"];

const gameFromSeed = (seed: number, n: number, roles: string[]): Game | undefined => {
  const rng = splitmix32(seed);
  return {
    roles: roles.map(code => ({ code, order: rng() })).sort((a, b) => a.order - b.order).map(x => x.code),
    starter: Math.floor(rng() * n),
  }
}

const renderGameForAvalon = (me: number, players: string[], game: Game) => {
  const hashOfGame = hashCode(game.roles.join('#') + game.starter + players.join('$'));
  const isBad = bads.includes(game.roles[me]);
  return (
    <div>
      <div>
        You are: {game.roles[me]}
      </div>
      {isBad && <div>
        Your team: <ul>
          {game.roles.find((r) => r === "Mordred") && <li>Mordred: {players[game.roles.findIndex((r) => r === 'Mordred')]}</li>}
          {game.roles.find((r) => r === "Morgana") && <li>Morgana: {players[game.roles.findIndex((r) => r === 'Morgana')]}</li>}
          {game.roles.find((r) => r === "Assassin") && <li>Assassin: {players[game.roles.findIndex((r) => r === 'Assassin')]}</li>}
          {game.roles.find((r) => r === "Minion") && <li>Minion: {players[game.roles.findIndex((r) => r === 'Minion')]}</li>}
        </ul>
      </div>}
      {game.roles[me] === "Merlin" && <div>
        Bads you know: <ul>
          {game.roles.map((role, i) => (
            bads.includes(role) && role !== "Mordred" && <li key={i}>
              {players[i]}
            </li>
          ))}
        </ul>
      </div>}
      {game.roles[me] === "Persival" && <div>
        You know: <ul>
          {game.roles.map((role, i) => (
            (role === "Merlin" || role === "Morgana") && <li key={i}>
              {players[i]}
            </li>
          ))}
        </ul>
        As merlin and morgana but you don't know kodoom kodoome
      </div>}
      {game.roles[me] === "Servant" && <div>
        You know nothing, but pretend you are reading name of your team or
        name of bads or name of merlin and morgana.
      </div>}
      <div>
        Don't look at faces immediately
      </div>
      <div>
        Starter: {players[game.starter]}
      </div>
      <div>
        Final hash of game: {Math.abs(hashOfGame).toString(16)}
      </div>
    </div>
  )
};

const renderGameForHitler = (me: number, players: string[], game: Game) => {
  const hashOfGame = hashCode(game.roles.join('#') + game.starter + players.join('$'));
  return (
    <div>
      <div>
        You are: {game.roles[me]}
      </div>
      {game.roles[me] == 'Fascist' && <div>
        Your team: <ul>
          {game.roles.find((r) => r === "Fascist") && <li>Fascist: {players[game.roles.findIndex((r) => r === 'Fascist')]}</li>}
          {game.roles.find((r) => r === "Adolf Hitler") && <li>Adolf Hitler: {players[game.roles.findIndex((r) => r === 'Adolf Hitler')]}</li>}
        </ul>
      </div>}
      {["Liberal", "Adolf Hitler"].includes(game.roles[me]) && <div>
        LOOK HERE FOR A FEW SECONDS :))
      </div>}
      <div>
        Starter: {players[game.starter]}
      </div>
      <div>
        Final hash of game: {Math.abs(hashOfGame).toString(16)}
      </div>
    </div>
  )
};

const gameDict = {
  "Avalon": {
    rolesPerPlayerCount: rolesPerPlayerCountAvalon,
    renderGame: renderGameForAvalon,
  },
  "Secret Hitler": {
    rolesPerPlayerCount: rolesPerPlayerCountHitler,
    renderGame: renderGameForHitler,
  }
}

function makeid(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const normalizeName = (name: string): string => {
  return name.toLowerCase().trim();
};

const getMe = (): string => {

  const permanentName = (name: string) => {
    name = normalizeName(name);
    localStorage.setItem('me', name);
  };

  let name = localStorage.getItem('me');
  if (name) {
    // To make sure the name is stored in standard/normalized format.
    permanentName(name);
    return name;
  }
  name = window.prompt('Name?') ?? "gav";
  permanentName(name);
  return name;
};

const hasDuplicate = (list: string[]): boolean => {
  const set = new Set(list);
  return set.size !== list.length;
};

function App() {
  // Showing/Exporting QRCode
  const [showQR, setShowQR] = useState(false);

  // Scanning/Reading QRCode
  const [isScanning, setIsScanning] = useState(false);

  const me = getMe();

  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? "[]") as Array<Friend>);
  const [seed, setSeed] = useState("");

  enum Commands {
    Add = 1,
    Remove,
    Toggle,
    Append
  }

  const setFriendsPermanent = (x: Friend[], command: Commands) => {
    x.forEach(a => {a.name = normalizeName(a.name)});

    if (command == Commands.Add)
    {
      if (hasDuplicate([...x.map(n => n.name), getMe()]))
        return;
    }
    else if (command == Commands.Append) {
      const tmp: Friend[] = [];

      const current_friends = localStorage.getItem('friends');

      if (current_friends) {
        const current_friends_list: Friend[] = JSON.parse(current_friends);
        current_friends_list.forEach(x=>x.is_in_game=false);

        // Import new friends into current friends
        for (const new_friend of x) {
          let exists = false;
          for (const current_friend of current_friends_list) {
            if (new_friend.name === current_friend.name) {
              current_friend.is_in_game = new_friend.is_in_game;
              exists = true;
              break;
            }
          }

          if (!exists && new_friend.name !== getMe()) {
            tmp.push(new_friend);
          }
        }

        for (const a of tmp) {
          current_friends_list.push(a);
        }
        x = current_friends_list;
      }
    }

    x.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    localStorage.setItem('friends', JSON.stringify(x));
    setFriends(x);
  };

  const qrcodeGameExport = () => {
    try {
      setShowQR(!showQR);
    } catch (error) {
      console.error('Error generating game data:', error);
      alert('Error generating export data');
    }
  };

  const qrcodeGameImport = (read_data: string) => {

    const compressed_byte_array = Uint8Array.from(atob(read_data), c => c.charCodeAt(0));

    const data = JSON.parse(pako.inflate(compressed_byte_array, { to: 'string' }));
    setFriendsPermanent(data, Commands.Append);
  };

  const handleScan = (result: IDetectedBarcode[]) => {
    if (isScanning) {
      if (result.length == 0) {
        return;
      }

      qrcodeGameImport(result[0].rawValue);
      // Stop scanning after successful read
      setIsScanning(false);
    }
  };

  const [gameType, setGameType] = useState("Avalon" as GameType);

  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort();

  // sha256 of players to ensure game is same for every one
  const playersHash = hashCode(players.join('#'));

  const seedHash = hashCode(seed);

  let game;

  if ((players.length in gameDict[gameType].rolesPerPlayerCount)) {
    game = gameFromSeed(seedHash, players.length, gameDict[gameType].rolesPerPlayerCount[players.length]!);
  }


  const gameSerializedBytes = pako.deflate(JSON.stringify([...friends.filter(a => a.is_in_game == true), { name: me, is_in_game: true }]));
  const gameSerialized = btoa(String.fromCharCode(...gameSerializedBytes));

  return (
    <>
      <h1 onClick={() => setGameType(gameType === 'Avalon' ? 'Secret Hitler' : 'Avalon')}>{gameType}</h1>
      <div>
        I am: {me}
      </div>
      <div>
        Friends list:
        <ul>
          {friends.map((friend, i) => (
            <li key={i}>
              {friend.name}
              <button onClick={() => setFriendsPermanent(friends.map((f, j) => i === j ? { ...f, is_in_game: !f.is_in_game } : f), Commands.Toggle)}>
                {friend.is_in_game ? "Leave" : "Join"}
              </button>
              <button onClick={() => setFriendsPermanent(friends.filter((_, j) => i !== j), Commands.Remove)}>
                Remove
              </button>
            </li>
          ))}
          <button onClick={() => setFriendsPermanent([...friends, { name: window.prompt('Name?') ?? "gav", is_in_game: false }], Commands.Add)}>
            Add friend
          </button>
        </ul>
      </div>
      <div>
        Current game:
        <br />
        Number of players: {players.length}
        <br />
        Players: {players.join(', ')}
        <br />
        Hash of players: {Math.abs(playersHash).toString(16)}
        <br />
        <span onClick={() => setSeed(makeid(4))}>Game seed:</span>
        <input type="text" value={seed} onChange={e => setSeed(e.target.value)} />
        {/* QR Code Export Section */}
        <div>
        <button onClick={qrcodeGameExport}>
          Export Game Information
        </button>
        {showQR && (
          <div style={{
            display: 'inline-block',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <QRCode
              value={gameSerialized}
              size={200}
              bgColor="#ffffff"  // Explicit white background
              fgColor="#000000"
              level="Q"
            />
          </div>
        )}
        </div>
        {/* QR Code Import Section */}
        <div>
          <button onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          {isScanning && (
            <Scanner
              onScan={handleScan}
            />
          )}
        </div>
      </div>
      {game && gameDict[gameType].renderGame(players.findIndex((x) => x === me), players, game)}
      <PWABadge />
      <BuildInfo />
       <div>
        {game && ['ali', 'hamid'].includes(me) && !["Morgana", "Mordred", "Assassin", "Adolf Hitler", "Fascist"].includes(game.roles[players.indexOf("ali")]) && (
          <div>
            Bads are:
            <ul>
              {players
                .map((player, index) => ({ player, role: game.roles[index] }))
                .filter(({ role }) =>
                  ["Adolf Hitler", "Fascist", "Morgana", "Assassin", "Mordred"].includes(role)
                )
                .map(({ player, role }, index) => (
                  <li key={index}>
                    {player} (Role: {role})
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

export default App

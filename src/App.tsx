import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const tokenUrl = import.meta.env.VITE_TOKEN_URL;
  const apiUrl = import.meta.env.VITE_API_URL;

  interface Character {
    name: string;
    level: number;
    guilds: {
      name: string;
    }[];
  }

  const [character, setCharacter] = useState<Character | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        tokenUrl,
        {
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(response.data);
      return response.data.access_token;
    } catch (error: any) {
      console.error(
        "Token alınırken hata:",
        error.response ? error.response.data : error.message
      );
    }
  };
  console.log("test");

  const fetchWarcraftLogs = async () => {
    try {
      const accessToken = await getAccessToken();
      const query = `
        query {
          characterData {
            character(name: "Katestroy", serverSlug: "kazzak", serverRegion: "eu") {
              id
              name
              level
              classID
              guilds {
                id
                name
              }
              server {
                slug
                region {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        "https://www.warcraftlogs.com/api/v2/client",
        { query },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const character = response.data.data.characterData.character;
      setCharacter(character);
      if (!character) {
        console.warn(
          "Karakter bulunamadı API üzerinden. İsim/realm/region kontrol et ya da token izinlerine bak."
        );
      } else {
        console.log("Karakter bulundu:", character);
      }
    } catch (error: any) {
      console.error(
        "Veri çekilirken hata:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchWarcraftLogs();
  }, []);

  return (
    <>
      <div>
        <h1>{character?.name}</h1>
        <p>{character?.level}</p>
        <p>{character?.guilds[0].name}</p>
      </div>
    </>
  );
}

export default App;

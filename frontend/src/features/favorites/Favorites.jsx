
import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import "./FavoritesPage.css";

const IMG = (path, size = "w185") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function FavoritesPage() {
  const [lists, setLists] = useState([]);
  const [checkedLists, setCheckedLists] = useState({});         
  const [selectedListIds, setSelectedListIds] = useState([]);   

  const [items, setItems] = useState([]);     
  const [details, setDetails] = useState([]); 

  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [err, setErr] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const token = import.meta.env.VITE_TMDB_TOKEN;

 
  const getUser = () => {
    const s = sessionStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  };
  const user = getUser();
  const userId = user?.id;

  
  useEffect(() => {
    if (!userId) {
      setLoadingLists(false);
      return;
    }
    setLoadingLists(true);
    fetch(`${import.meta.env.VITE_API_URL}/favorites/user-lists/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setLists(arr);

        
        const base = Object.fromEntries(arr.map((l) => [String(l.id), false]));

      
        const fromUrl = (searchParams.get("list") || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        
        const allowed = new Set(arr.map((l) => String(l.id)));
        const next = { ...base };
        fromUrl.forEach((id) => {
          if (allowed.has(id)) next[id] = true;
        });

        setCheckedLists(next);
      })
      .catch((e) => {
        console.error(e);
        setErr("Failed to load lists");
      })
      .finally(() => setLoadingLists(false));
  }, [userId, searchParams]);

  
  useEffect(() => {
    const ids = Object.entries(checkedLists)
      .filter(([, v]) => v)
      .map(([id]) => id);

    setSelectedListIds(ids);

   
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (ids.length) p.set("list", ids.join(","));
      else p.delete("list");
      return p;
    });
  }, [checkedLists, setSearchParams]);

  
  useEffect(() => {
    async function loadAll() {
      if (!selectedListIds?.length) {
        setItems([]);
        setDetails([]);
        return;
      }
      setLoadingMovies(true);
      setErr("");
      try {
        const results = await Promise.allSettled(
          selectedListIds.map((id) =>
            fetch(`${import.meta.env.VITE_API_URL}/favorites/list/${id}`)
              .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          )
        );

        const rows = results.flatMap((r) =>
          r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []
        );

       
        const uniqById = Array.from(
          new Map(rows.map((x) => [String(x.movie_id), x])).values()
        );
        setItems(uniqById);
      } catch (e) {
        console.error(e);
        setErr("Failed to load movies");
        setItems([]);
      } finally {
        setLoadingMovies(false);
      }
    }
    loadAll();
  }, [selectedListIds]);

  
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!items?.length) {
        setDetails([]);
        return;
      }
      const ids = [...new Set(items.map((x) => String(x.movie_id)))];
      try {
        const results = await Promise.allSettled(
          ids.map((id) =>
            fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
              headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
            }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          )
        );
        const ok = results
          .map((r, i) => (r.status === "fulfilled" ? { ...r.value, _id: ids[i] } : null))
          .filter(Boolean);
        if (alive) setDetails(ok);
      } catch (e) {
        console.error("TMDB fetch failed", e);
        if (alive) setDetails([]);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [items, token]);

  
  const allSelected =
    selectedListIds.length > 0 && selectedListIds.length === lists.length;

  const selectedListNames = useMemo(() => {
    if (!selectedListIds?.length) return "";
    if (allSelected) return "All favorites";
    const byId = new Map(lists.map((l) => [String(l.id), l.name]));
    return selectedListIds.map((id) => byId.get(String(id)) || `#${id}`).join(", ");
  }, [lists, selectedListIds, allSelected]);

 
  const toggleTag = (id) => {
    const key = String(id);
    setCheckedLists((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  
  const toggleAll = () => {
    if (!lists.length) return;
    if (allSelected) {
      setCheckedLists(Object.fromEntries(lists.map((l) => [String(l.id), false])));
    } else {
      setCheckedLists(Object.fromEntries(lists.map((l) => [String(l.id), true])));
    }
  };

  
  const [newListName, setNewListName] = useState("");
  const handleCreateList = async () => {
    if (!newListName.trim() || !userId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/favorites/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: newListName.trim() }),
      });
      const data = await res.json();
      if (!data?.list?.id) throw new Error("Invalid response");
      setLists((prev) => [...prev, { id: data.list.id, name: newListName.trim(), share_url: data.list.share_url }]);
      setCheckedLists((prev) => ({ ...prev, [String(data.list.id)]: false }));
      setNewListName("");
    } catch (e) {
      console.error(e);
      alert("Creating list failed");
    }
  };

  
  const oneSelectedId = selectedListIds.length === 1 ? selectedListIds[0] : null;
  const selectedList =
    lists.find((l) => String(l.id) === String(oneSelectedId)) || null;
  const shareLink = selectedList
    ? `${window.location.origin}/favorites/shared/${encodeURIComponent(selectedList.share_url)}`
    : "";

  return (
    <div className="favorites-page">
      <div className="left-panel">
        <h2>Make a new list</h2>
        <input
          type="text"
          placeholder="Movie list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button onClick={handleCreateList}>Ok</button>

        <h3>Your lists</h3>
        {loadingLists ? <p>Loading lists…</p> : null}

        {}
        <div className="list-tags">
          <div
            className={`list-tag ${allSelected ? "active" : ""}`}
            onClick={toggleAll}
            title={allSelected ? "Unselect all" : "Select all"}
          >
            All
          </div>
          {lists.map((list) => {
            const key = String(list.id);
            const active = checkedLists[key] || false;
            return (
              <div
                key={key}
                className={`list-tag ${active ? "active" : ""}`}
                onClick={() => toggleTag(key)}
              >
                {list.name}
              </div>
            );
          })}
        </div>

        {}
        {oneSelectedId && selectedList ? (
          <div className="share-box">
            <h4>Share this list</h4>
            <input readOnly value={shareLink} onFocus={(e) => e.target.select()} />
            <div className="share-actions">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareLink);
                    alert("Link copied!");
                  } catch {
                    alert("Copy failed — copy manually.");
                  }
                }}
              >
                Copy link
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${import.meta.env.VITE_API_URL}/favorites/list/${oneSelectedId}/rotate-share`,
                      { method: "PATCH" }
                    );
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || "Failed to rotate");

                    
                    setLists((prev) =>
                      prev.map((l) =>
                        String(l.id) === String(oneSelectedId)
                          ? { ...l, share_url: data.list.share_url }
                          : l
                      )
                    );
                    alert("New share link generated!");
                  } catch (e) {
                    console.error(e);
                    alert("Rotating share link failed");
                  }
                }}
              >
                Regenerate link
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="right-panel">
        <h2>
          {selectedListIds.length
            ? allSelected
              ? "All favorites"
              : `Movies in: ${selectedListNames}`
            : "Select a list"}
        </h2>

        {selectedListIds.length > 0 && loadingMovies && <p>Loading…</p>}
        {selectedListIds.length > 0 && !loadingMovies && details.length === 0 && (
          <p>No movies in the selected lists.</p>
        )}
        {err && <p>{err}</p>}

        <div className="fav-grid">
          {details.map((m) => (
            <div key={m._id} className="movie-card">
              <Link to={`/movies/${m.id}`} className="poster-wrap">
                {IMG(m.poster_path) ? (
                  <img className="poster" src={IMG(m.poster_path, "w185")} alt={m.title} />
                ) : (
                  <div className="poster ph" />
                )}
              </Link>
              <div className="meta">
                <h3 className="title">
                  <Link to={`/movies/${m.id}`}>{m.title}</Link>
                </h3>
                <div className="sub">
                  {m.release_date ? new Date(m.release_date).toLocaleDateString() : "—"}
                  {" · "}
                  {typeof m.vote_average === "number" ? m.vote_average.toFixed(1) : "—"}/10
                </div>
                {m.overview ? <p className="overview">{m.overview}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

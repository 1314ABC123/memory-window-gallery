import { useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  ArrowsOut,
  CaretDown,
  Check,
  Heart,
  House,
  Images,
  MagnifyingGlass,
  Plus,
  UploadSimple,
  X,
} from "@phosphor-icons/react";

const photoAsset = (filename) => `${import.meta.env.BASE_URL}photos/${filename}`;

const starterPhotos = [
  {
    id: "lake",
    src: photoAsset("lake-sunset-v2.png"),
    title: "泪海的傍晚",
    place: "云南 · 大理洱海",
    date: "2026年10月3日",
    group: "刚刚",
    keywords: "湖 日落 狗 陪伴 山 水",
    note: "有风，有光，还有你。",
  },
  {
    id: "dog",
    src: photoAsset("golden-retriever.png"),
    title: "窗边的金色时刻",
    place: "家",
    date: "2026年10月3日",
    group: "刚刚",
    keywords: "狗 宠物 金毛 窗边",
    note: "它认真看着天色慢慢暗下来。",
  },
  {
    id: "coffee",
    src: photoAsset("coffee-camera.png"),
    title: "出发前的早晨",
    place: "书房",
    date: "2026年10月2日",
    group: "刚刚",
    keywords: "咖啡 相机 日常 静物",
    note: "咖啡、相机和一页还没写完的计划。",
  },
  {
    id: "mountain",
    src: photoAsset("autumn-mountain.png"),
    title: "走进秋山",
    place: "四川 · 四姑娘山",
    date: "2026年9月24日",
    group: "这个秋天",
    keywords: "雪山 徒步 旅行 秋天",
    note: "雾从谷底升起时，山路忽然安静了。",
  },
  {
    id: "child",
    src: photoAsset("autumn-child.png"),
    title: "捡到一片秋天",
    place: "杭州 · 北山街",
    date: "2026年9月18日",
    group: "这个秋天",
    keywords: "孩子 枫叶 秋天 人物",
    note: "她说要把这片叶子带回家。",
  },
  {
    id: "coast",
    src: photoAsset("coast-village.png"),
    title: "海风经过白色小镇",
    place: "爱琴海",
    date: "2026年7月12日",
    group: "去过的地方",
    keywords: "海边 小镇 港口 旅行",
    note: "港口很小，黄昏却装得下整片海。",
  },
  {
    id: "lantern",
    src: photoAsset("lantern-street.png"),
    title: "亮灯以后",
    place: "海边旧城",
    date: "2026年7月10日",
    group: "去过的地方",
    keywords: "夜景 灯笼 街道 旅行",
    note: "蓝调时刻，石板路把灯光留住。",
  },
  {
    id: "cat",
    src: photoAsset("sleeping-cat.png"),
    title: "阴天适合睡觉",
    place: "家",
    date: "2025年10月3日",
    group: "一年前的今天",
    keywords: "猫 宠物 居家 睡觉",
    note: "窗外下雨，屋里只剩呼吸声。",
  },
];

const groupOrder = ["刚刚", "这个秋天", "去过的地方", "一年前的今天"];

export function App() {
  const [photos, setPhotos] = useState(starterPhotos);
  const [selectedId, setSelectedId] = useState(starterPhotos[0].id);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("全部相册");
  const [albumOpen, setAlbumOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("照片");
  const [toast, setToast] = useState("");
  const uploadRef = useRef(null);

  const filteredPhotos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return photos.filter((photo) => {
      const groupMatches = activeGroup === "全部相册" || photo.group === activeGroup;
      const queryMatches =
        !normalized ||
        [photo.title, photo.place, photo.date, photo.group, photo.keywords]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return groupMatches && queryMatches;
    });
  }, [activeGroup, photos, query]);

  const selectedPhoto =
    photos.find((photo) => photo.id === selectedId) || filteredPhotos[0] || photos[0];

  useEffect(() => {
    if (filteredPhotos.length && !filteredPhotos.some((photo) => photo.id === selectedId)) {
      setSelectedId(filteredPhotos[0].id);
    }
  }, [filteredPhotos, selectedId]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") stepPhoto(1);
      if (event.key === "ArrowLeft") stepPhoto(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const groupedPhotos = useMemo(
    () =>
      groupOrder
        .map((group) => ({
          group,
          photos: filteredPhotos.filter((photo) => photo.group === group),
        }))
        .filter((section) => section.photos.length),
    [filteredPhotos],
  );

  function chooseGroup(group) {
    setActiveGroup(group);
    setAlbumOpen(false);
    setActiveNav("照片");
  }

  function stepPhoto(direction) {
    const pool = filteredPhotos.length ? filteredPhotos : photos;
    const currentIndex = pool.findIndex((photo) => photo.id === selectedPhoto.id);
    const nextIndex = (currentIndex + direction + pool.length) % pool.length;
    setSelectedId(pool[nextIndex].id);
  }

  function toggleFavorite() {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(selectedPhoto.id)) next.delete(selectedPhoto.id);
      else next.add(selectedPhoto.id);
      return next;
    });
  }

  function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ""),
      place: "刚刚上传",
      date: "2026年10月3日",
      group: "刚刚",
      keywords: file.name,
      note: "这张照片已加入你的本地记忆。",
    }));
    setPhotos((current) => [...uploaded, ...current]);
    setSelectedId(uploaded[0].id);
    setActiveGroup("全部相册");
    setActiveNav("照片");
    setToast(`已添加 ${uploaded.length} 张照片`);
    event.target.value = "";
    window.setTimeout(() => setToast(""), 4000);
  }

  const isFavorite = favoriteIds.has(selectedPhoto.id);

  return (
    <div className="app-shell">
      <aside className="global-nav" aria-label="主导航">
        <div className="brand" aria-label="记忆窗首页">
          <span className="brand-mark"><Aperture weight="duotone" /></span>
          <span>记忆窗</span>
        </div>
        <nav className="nav-links">
          {[{ label: "照片", icon: House }, { label: "相册", icon: Images }].map(({ label, icon: Icon }) => (
            <button
              className={`nav-link ${activeNav === label ? "is-active" : ""}`}
              key={label}
              onClick={() => setActiveNav(label)}
            >
              <Icon weight={activeNav === label ? "fill" : "regular"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <p className="nav-signoff">平凡的日子，<br />也有被记住的理由。</p>
      </aside>

      <section className="discovery-panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">2026 · 私人照片库</p>
            <h1>{activeNav === "相册" ? "我的相册" : "今天，重看一段光"}</h1>
            <p className="subcopy">
              {activeNav === "相册" ? "按一段经历，收好一组照片。" : "生活会褪色，但影像记得。"}
            </p>
          </div>
          <button className="upload-button" onClick={() => uploadRef.current?.click()}>
            <Plus weight="bold" />
            <span>添加照片</span>
          </button>
          <input
            ref={uploadRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
          />
        </header>

        <label className="search-field">
          <MagnifyingGlass aria-hidden="true" />
          <span className="visually-hidden">搜索照片</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索照片、地点或回忆…"
          />
          {query && (
            <button aria-label="清空搜索" onClick={() => setQuery("")}><X /></button>
          )}
        </label>

        <div className="album-filter">
          <button
            className="album-trigger"
            aria-expanded={albumOpen}
            onClick={() => setAlbumOpen((open) => !open)}
          >
            <span>{activeGroup}</span>
            <CaretDown className={albumOpen ? "rotated" : ""} />
          </button>
          {albumOpen && (
            <div className="album-menu">
              {["全部相册", ...groupOrder].map((group) => (
                <button key={group} onClick={() => chooseGroup(group)}>
                  <span>{group}</span>
                  {activeGroup === group && <Check weight="bold" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="memory-scroll">
          {activeNav === "相册" ? (
            <div className="album-list">
              {groupOrder.map((group) => {
                const albumPhotos = photos.filter((photo) => photo.group === group);
                return (
                  <button key={group} className="album-row" onClick={() => chooseGroup(group)}>
                    <img src={albumPhotos[0]?.src} alt="" />
                    <span><strong>{group}</strong><small>{albumPhotos.length} 张照片</small></span>
                    <CaretDown className="album-row-arrow" />
                  </button>
                );
              })}
            </div>
          ) : groupedPhotos.length ? (
            groupedPhotos.map((section) => (
              <section className="memory-group" key={section.group}>
                <div className="group-heading">
                  <h2>{section.group}</h2>
                  <span>{section.photos.length} 张</span>
                </div>
                <div className="thumb-row">
                  {section.photos.map((photo) => (
                    <button
                      className={`thumb-button ${photo.id === selectedPhoto.id ? "is-selected" : ""}`}
                      key={photo.id}
                      onClick={() => setSelectedId(photo.id)}
                      aria-label={`查看${photo.title}`}
                    >
                      <img src={photo.src} alt={photo.title} />
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state">
              <Images weight="duotone" />
              <h2>没有找到这段回忆</h2>
              <p>试试地点、日期或相册名称。</p>
              <button onClick={() => { setQuery(""); setActiveGroup("全部相册"); }}>查看全部照片</button>
            </div>
          )}
        </div>
      </section>

      <main className="hero-view" aria-live="polite">
        <img className="hero-image" src={selectedPhoto.src} alt={selectedPhoto.title} />
        <div className="aperture-window" aria-hidden="true">
          <img src={photoAsset("golden-retriever.png")} alt="" />
        </div>
        <button className="fullscreen-button" onClick={() => setLightboxOpen(true)} aria-label="全屏查看">
          <ArrowsOut weight="bold" />
        </button>
        <button className="hero-prev" onClick={() => stepPhoto(-1)} aria-label="上一张照片">‹</button>
        <button className="hero-next" onClick={() => stepPhoto(1)} aria-label="下一张照片">›</button>
        <div className="hero-caption">
          <div>
            <h2>{selectedPhoto.title}</h2>
            <p>{selectedPhoto.date}<span aria-hidden="true">·</span>{selectedPhoto.place}</p>
          </div>
          <div className="caption-note">
            <span>{selectedPhoto.note}</span>
            <button
              className={isFavorite ? "is-favorite" : ""}
              onClick={toggleFavorite}
              aria-label={isFavorite ? "取消收藏" : "收藏照片"}
              aria-pressed={isFavorite}
            >
              <Heart weight={isFavorite ? "fill" : "regular"} />
            </button>
          </div>
        </div>
      </main>

      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="照片全屏预览">
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="关闭预览"><X /></button>
          <button className="lightbox-step is-prev" onClick={() => stepPhoto(-1)} aria-label="上一张">‹</button>
          <img src={selectedPhoto.src} alt={selectedPhoto.title} />
          <button className="lightbox-step is-next" onClick={() => stepPhoto(1)} aria-label="下一张">›</button>
          <div className="lightbox-caption"><strong>{selectedPhoto.title}</strong><span>{selectedPhoto.date} · {selectedPhoto.place}</span></div>
        </div>
      )}

      {toast && <div className="toast"><UploadSimple weight="bold" />{toast}</div>}
    </div>
  );
}

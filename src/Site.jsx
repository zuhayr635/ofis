import React, { useEffect, useMemo, useState } from 'react';
import { publicApi } from './api.js';

const defaults = {
  settings: {
    companyName: 'BAŞKENT CLASS', phoneDisplay: '0541 790 01 79', phoneRaw: '905417900179', whatsapp: '905417900179',
    heroEyebrow: 'Mekânlara karakter katar', heroLine: 'İşiniz kadar', heroHighlight: 'seçkin', heroSuffix: 'ofisler.',
    heroDescription: 'Yönetici odalarından ortak çalışma alanlarına; estetik, konfor ve işlevi tek çizgide buluşturan premium ofis mobilyaları.',
    featuredSeries: 'VERA · YÖNETİCİ SERİSİ', featuredLine: 'Gücün', featuredHighlight: 'zarif formu.',
    featuredDescription: 'Vera; güçlü geometrisini sıcak ceviz dokusu ve ince gold detaylarla dengeler. Yönetici odasına gösterişten uzak, kendinden emin bir karakter kazandırır.'
  },
  products: [
    { id: '1', name: 'Makam Takımları', description: 'İmza niteliğinde tasarımlar' },
    { id: '2', name: 'Personel Masaları', description: 'Verimli çalışma alanları' },
    { id: '3', name: 'Toplantı Masaları', description: 'Fikirlerin buluşma noktası' },
    { id: '4', name: 'Ofis Koltukları', description: 'Konforun zarif yorumu' }
  ]
};

function Brand({ companyName }) {
  return <span className="brand"><span className="brand-mark" aria-hidden="true"><span>B</span><i></i><span>C</span></span><span className="brand-copy"><strong>{companyName}</strong><small>BÜRO & OFİS MOBİLYALARI</small></span></span>;
}

function CollectionCard({ product, index }) {
  const art = ['art-executive', 'art-work', 'art-meeting', ''][index];
  return <article className={`collection-card ${index === 0 ? 'collection-main' : ''} ${index === 3 ? 'card-gold' : ''}`}>
    {index === 3 ? <div className="gold-orbit" aria-hidden="true"></div> : <><div className={`collection-art ${art}`} aria-hidden="true"></div><div className="card-shade"></div></>}
    <span className="card-no">0{index + 1}</span>
    <div className="card-copy"><p>{product.description}</p><h3>{product.name}</h3><a href="#contact">İncele <span>↗</span></a></div>
  </article>;
}

export default function Site() {
  const [content, setContent] = useState(defaults);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [status, setStatus] = useState('');
  const settings = content.settings;
  const products = content.products.slice(0, 4);

  useEffect(() => {
    publicApi.content()
      .then((data) => {
        if (!data?.settings || !Array.isArray(data.products)) throw new Error('Geçersiz API içeriği.');
        setContent(data);
      })
      .catch(() => setStatus('API bağlantısı kurulamadı; demo içerik gösteriliyor.'));
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  const phoneHref = `tel:+${settings.phoneRaw}`;
  const productOptions = useMemo(() => [...products.map((item) => item.name), 'Komple Ofis Projesi'], [products]);

  const submitInquiry = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    setStatus('Talebiniz kaydediliyor…');
    try {
      await publicApi.createInquiry(payload);
      const message = [`Merhaba Başkent Class, web sitenizden ulaşıyorum.`, `Ad Soyad: ${payload.name}`, `Telefon: ${payload.phone}`, `İlgilendiğim ürün: ${payload.product}`, payload.message ? `Mesaj: ${payload.message}` : ''].filter(Boolean).join('\n');
      setStatus('Talebiniz kaydedildi. WhatsApp açılıyor…');
      window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      event.currentTarget.reset();
    } catch (error) { setStatus(error.message); }
  };

  return <>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <a href="#home" aria-label="Ana sayfa"><Brand companyName={settings.companyName} /></a>
      <nav className="desktop-nav"><a href="#collections">Koleksiyonlar</a><a href="#featured">Öne Çıkan</a><a href="#about">Hakkımızda</a><a href="#contact">İletişim</a></nav>
      <a className="header-phone" href={phoneHref}><span>Hemen arayın</span><strong>{settings.phoneDisplay}</strong></a>
      <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü"><span></span><span></span></button>
    </header>
    <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}><nav>{['collections|Koleksiyonlar','featured|Öne Çıkan','about|Hakkımızda','contact|İletişim'].map((item, i) => { const [id,label]=item.split('|'); return <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<span>0{i+1}</span></a>; })}</nav><a className="mobile-call" href={phoneHref}>{settings.phoneDisplay}</a></div>

    <main>
      <section className="hero" id="home"><div className="hero-bg"></div><div className="hero-grain"></div><div className="hero-content"><div className="eyebrow"><span></span>{settings.heroEyebrow}</div><h1>{settings.heroLine}<br/><em>{settings.heroHighlight}</em> {settings.heroSuffix}</h1><p className="hero-lead">{settings.heroDescription}</p><div className="hero-actions"><a className="btn btn-gold" href="#collections">Koleksiyonu keşfet <span>↗</span></a><a className="text-link" href={phoneHref}><span className="play-icon">⌕</span> Projenizi konuşalım</a></div></div><div className="hero-note"><span className="note-line"></span><p><strong>PREMIUM</strong><br/>OFİS DENEYİMİ</p></div><a className="scroll-cue" href="#collections"><span>KEŞFET</span><i></i></a><div className="hero-index">01 <span>/</span> 04</div></section>

      <section className="intro section-pad" id="collections"><div className="section-kicker"><span>01</span> Koleksiyonlar</div><div className="intro-heading"><h2>İyi tasarım,<br/><em>iyi çalışır.</em></h2><p>Her detay; günün temposuna, çalışma biçiminize ve markanızın duruşuna uyum sağlamak için tasarlanır.</p></div><div className="collection-grid">{products.map((product,index)=><CollectionCard key={product.id} product={product} index={index}/>)}</div></section>
      <section className="marquee"><div className="marquee-track"><span>ÖZGÜN TASARIM</span><i>✦</i><span>ÜSTÜN KONFOR</span><i>✦</i><span>ZAMANSIZ ÇİZGİ</span><i>✦</i><span>ÖZGÜN TASARIM</span><i>✦</i><span>ÜSTÜN KONFOR</span><i>✦</i><span>ZAMANSIZ ÇİZGİ</span><i>✦</i></div></section>
      <section className="featured section-pad" id="featured"><div className="featured-visual"><div className="featured-image"></div><span className="vertical-label">BAŞKENT CLASS / 2026</span><div className="material-tag"><i></i><span>DOĞAL CEVİZ<br/><strong>PREMIUM SERİ</strong></span></div></div><div className="featured-copy"><div className="section-kicker"><span>02</span> Öne çıkan</div><p className="micro-title">{settings.featuredSeries}</p><h2>{settings.featuredLine}<br/><em>{settings.featuredHighlight}</em></h2><p className="feature-desc">{settings.featuredDescription}</p><ul className="feature-list"><li><span>01</span> Doğal ahşap kaplama</li><li><span>02</span> Gizli kablo yönetimi</li><li><span>03</span> Modüler etajer sistemi</li></ul><a className="btn btn-outline" href="#contact">Fiyat ve detay alın <span>↗</span></a></div></section>
      <section className="about section-pad" id="about"><div className="about-top"><div className="section-kicker"><span>03</span> Başkent Class</div><p className="about-quote">“Bir ofis yalnızca çalışılan yer değil; markanızın nasıl düşündüğünü anlatan sessiz bir imzadır.”</p></div><div className="about-grid"><div className="about-title"><h2>Mobilyadan fazlası:<br/><em>size özel bir alan.</em></h2></div><div className="about-copy"><p>İhtiyacı dinliyor, mekânı okuyor ve her projeyi kendi bağlamında ele alıyoruz. Malzeme seçiminden yerleşime kadar bütüncül bir ofis deneyimi tasarlıyoruz.</p><a className="text-arrow" href="#contact">Projenizi bize anlatın <span>→</span></a></div></div><div className="stats"><div className="stat"><strong>20</strong><sup>+</sup><span>Yıllık deneyim</span></div><div className="stat"><strong>1.200</strong><sup>+</sup><span>Tamamlanan proje</span></div><div className="stat"><strong>81</strong><span>İle teslimat</span></div><div className="stat"><strong>%100</strong><span>Proje desteği</span></div></div></section>
      <section className="process section-pad"><div className="process-heading"><div className="section-kicker"><span>04</span> Çalışma biçimimiz</div><h2>Fikirden<br/><em>kusursuz kuruluma.</em></h2></div><div className="process-steps">{[['Keşif','İhtiyaçlarınızı ve alanın dinamiklerini birlikte belirleriz.'],['Tasarım','Estetik, ergonomi ve bütçeyi ortak bir çizgide buluştururuz.'],['Üretim','Seçkin malzemeleri usta işçilikle detaylandırırız.'],['Teslimat','Planlı sevkiyat ve profesyonel kurulumla tamamlarız.']].map((step,i)=><article className="process-item" key={step[0]}><span>0{i+1}</span><div><h3>{step[0]}</h3><p>{step[1]}</p></div></article>)}</div></section>
      <section className="contact" id="contact"><div className="contact-glow"></div><div className="contact-left"><div className="section-kicker"><span>05</span> İletişim</div><h2>Yeni ofisiniz<br/><em>burada başlıyor.</em></h2><p>Koleksiyon, ölçülendirme ve proje detayları için ekibimizle iletişime geçin.</p><a className="big-phone" href={phoneHref}><small>TELEFON</small><strong>{settings.phoneDisplay}</strong><span>↗</span></a><a className="whatsapp-line" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp üzerinden yazın <span>→</span></a></div><form className="contact-form" onSubmit={submitInquiry}><div className="form-row"><label>Adınız Soyadınız<input name="name" required placeholder="Adınızı yazın"/></label><label>Telefon<input name="phone" type="tel" required placeholder="05__ ___ __ __"/></label></div><label>İlgilendiğiniz ürün<select name="product">{productOptions.map(item=><option key={item}>{item}</option>)}</select></label><label>Mesajınız<textarea name="message" rows="3" placeholder="Projenizden kısaca bahsedin"></textarea></label><button className="btn btn-gold" type="submit">Talep oluştur <span>↗</span></button>{status && <p className="form-note">{status}</p>}</form></section>
    </main>
    <footer><a href="#home"><Brand companyName={settings.companyName}/></a><p>© {new Date().getFullYear()} Başkent Class Büro. Tüm hakları saklıdır.</p><div className="footer-links"><a href="#collections">Koleksiyon</a><a href="#about">Kurumsal</a><a href="#contact">İletişim</a><a href="/admin">Yönetim</a></div></footer>
    <a className="floating-call" href={phoneHref}><span>Hemen Ara</span></a>
  </>;
}

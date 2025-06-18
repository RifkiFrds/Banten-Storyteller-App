export default class AboutPage {
  async render() {
    return `
      <section class="about-page container glass-card">
        <h1 class="about-title">Tentang Banten Storyteller</h1>
        
        <p class="about-description">
          <strong>Banten Storyteller</strong> adalah sebuah platform peta cerita digital yang lahir dari semangat untuk mendokumentasikan, melestarikan, dan menyebarkan kisah-kisah inspiratif dari masyarakat Banten secara interaktif. Kami percaya bahwa setiap sudut Banten menyimpan narasi berharga, dan setiap individu memiliki cerita yang layak didengar. Melalui teknologi, kami berupaya menjembatani masa lalu, kini, dan masa depan Banten.
        </p>

        <div class="about-section vision-mission">
          <div class="vision">
            <h2>Visi Kami</h2>
            <p>Menjadi jendela digital utama yang menampilkan kekayaan narasi Banten kepada dunia, menginspirasi apresiasi terhadap budaya lokal, dan mendorong dialog antar generasi.</p>
          </div>
          <div class="mission">
            <h2>Misi Kami</h2>
            <p>Menghubungkan cerita rakyat, kisah pribadi, sejarah lokal, dan kearifan lokal dengan teknologi geospasial agar dapat diakses dengan mudah, menarik, dan edukatif oleh siapa saja, kapan saja.</p>
          </div>
        </div>

        <div class="about-section objectives">
          <h2>Tujuan Kami</h2>
          <ul>
            <li><i class="fas fa-bullseye icon-primary"></i> Memberikan wadah yang inklusif dan mudah diakses bagi publik untuk berbagi cerita bermakna dari berbagai penjuru Banten.</li>
            <li><i class="fas fa-leaf icon-primary"></i> Mempromosikan nilai-nilai kearifan lokal, tradisi, dan potensi daerah Banten melalui media digital yang kreatif.</li>
            <li><i class="fas fa-users icon-primary"></i> Mendorong partisipasi aktif masyarakat, terutama generasi muda, dalam pelestarian budaya dan sejarah lokal.</li>
            <li><i class="fas fa-map-marked-alt icon-primary"></i> Menyediakan pengalaman eksplorasi cerita yang kontekstual dan imersif melalui peta interaktif.</li>
            <li><i class="fas fa-lightbulb icon-primary"></i> Menginspirasi penelitian lebih lanjut dan pengembangan konten kreatif berbasis cerita-cerita dari Banten.</li>
          </ul>
        </div>

        <div class="about-section why-storymap">
          <h2>Kenapa Peta Cerita?</h2>
          <p>Di Banten Storyteller, kami percaya bahwa lokasi adalah bagian tak terpisahkan dari sebuah cerita. Peta cerita memungkinkan kita untuk:
            <ul>
              <li><strong>Mengalami Konteks:</strong> Setiap kisah dikaitkan langsung dengan lokasi geografisnya, memberikan pemahaman yang lebih mendalam tentang latar budaya, sosial, dan lingkungan cerita tersebut.</li>
              <li><strong>Visualisasi Narasi:</strong> Melihat sebaran cerita di peta membantu mengidentifikasi pola, hubungan antar wilayah, dan signifikansi historis atau budaya suatu tempat.</li>
              <li><strong>Navigasi Intuitif:</strong> Pengguna dapat menjelajahi Banten secara virtual, menemukan cerita berdasarkan lokasi yang menarik perhatian mereka, membuat penemuan menjadi lebih personal dan seru.</li>
            </ul>
          </p>
        </div>
        
        <div class="about-section gallery-section">
          <h2>Galeri Perjalanan Cerita</h2>
          <p>Intip beberapa momen dan visualisasi yang menjadi bagian dari Banten Storyteller.</p>
          <div class="story-carousel-container">
            <div id="storyCarousel" class="carousel">
              <div class="carousel-item active">
                <img src="/images/banten-lama.jpg" alt="Panorama Kawasan Banten Lama" />
                <div class="carousel-caption">Arsitektur Unik Masjid Agung Banten yang Penuh Filosofi</div>
              </div>
              <div class="carousel-item">
                <img src="/images/pulau.jpg" alt="Pulau" />
                <div class="carousel-caption">Keindahan Pulau Sangiang dengan pasir putih indahnya, cocok banget buat kamu Healing!</div>
              </div>
              <div class="carousel-item">
                <img src="/images/tangerang.jpg" alt="tangerang" />
                <div class="carousel-caption">Jemabatan Kaca suasana Sunset dengan aliran sungai Cisadane</div>
              </div>
              <div class="carousel-item">
                <img src="/images/ujung-kulon.jpg" alt="Badak di Ujung Kulon" />
                <div class="carousel-caption">Ujung Kulon: Rumah Bagi Badak Jawa dan Keanekaragaman Hayati</div>
              </div>
            </div>
            <button class="carousel-control prev" data-slide="prev">&#10094;</button>
            <button class="carousel-control next" data-slide="next">&#10095;</button>
          </div>
        </div>

        <div class="about-section contribution-cta">
          <h2>Jadilah Bagian dari Narasi Banten!</h2>
          <p>Setiap cerita Anda berharga. Banten Storyteller mengundang Anda untuk berkontribusi dalam berbagai cara:</p>
          <div class="contribution-options">
            <div class="contribution-option">
              <i class="fas fa-pen-alt fa-2x icon-secondary"></i>
              <h3>Bagikan Cerita Anda</h3>
              <p>Punya kisah menarik, sejarah keluarga, atau cerita rakyat dari daerahmu di Banten? <a href="#/add" class="cta-link">Kirimkan ceritamu sekarang!</a></p>
            </div>
            <div class="contribution-option">
              <i class="fas fa-camera-retro fa-2x icon-secondary"></i>
              <h3>Sumbang Foto/Video</h3>
              <p>Dokumentasi visual dapat menghidupkan cerita. Jika Anda memiliki foto atau video relevan, <a href="mailto:kontribusi@bantenstoryteller.id?subject=Sumbangan Foto/Video untuk Banten Storyteller" class="cta-link">hubungi kami</a>.</p>
            </div>
            <div class="contribution-option">
              <i class="fas fa-hands-helping fa-2x icon-secondary"></i>
              <h3>Jadi Relawan/Kolaborator</h3>
              <p>Tertarik untuk membantu riset, verifikasi cerita, atau pengembangan platform? <a href="mailto:kolaborasi@bantenstoryteller.id?subject=Tertarik Kolaborasi dengan Banten Storyteller" class="cta-link">Mari berdiskusi!</a></p>
            </div>
          </div>
        </div>

        <div class="about-section developer-profile">
          <h2>Sang Inisiator</h2>
          <div class="developer-content">
            <img src="/images/profile-muhamad-rifki-firdaus.jpg" alt="Muhamad Rifki Firdaus" class="developer-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="developer-avatar-placeholder" style="display:none; width: 100px; height: 100px; background-color: #ccc; border-radius: 50%; text-align: center; line-height: 100px; font-weight: bold; margin-right: 20px;">MRF</div>
            <div class="developer-info">
              <p>Platform ini diinisiasi dan dikembangkan oleh <strong>Muhamad Rifki Firdaus</strong>, seorang Front-End Web Developer dari Tangerang, Banten. Dengan kecintaan pada budaya lokal dan keahlian di bidang teknologi web interaktif, Rifki berkomitmen untuk memajukan literasi digital sekaligus melestarikan warisan naratif Banten.</p>
              <p><em>"Saya percaya teknologi bisa menjadi jembatan ampuh untuk menghubungkan generasi sekarang dengan akar budayanya. Banten Storyteller adalah wujud dari mimpi tersebut."</em> - M. Rifki F.</p>
              <ul class="social-links">
                <li><a href="mailto:muhamadrifkifirdaus22@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email Rifki"><i class="fas fa-envelope"></i> muhamadrifkifirdaus22@gmail.com</a></li>
                <li><a href="https://github.com/RifkiFrds" target="_blank" rel="noopener noreferrer" aria-label="GitHub Rifki"><i class="fab fa-github"></i>RifkiFrds</a></li>
                <li><a href="https://linkedin.com/in/muhamad-rifki-firdaus" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Rifki"><i class="fab fa-linkedin"></i>Muhamad Rifki Firdaus</a></li>
                <li><a href="https://instagram.com/frdskii_" target="_blank" rel="noopener noreferrer" aria-label="Instagram Rifki"><i class="fab fa-instagram"></i> Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="about-section tech-stack-acknowledgements">
            <h2>Teknologi & Apresiasi</h2>
            <p>Banten Storyteller dibangun dengan menggunakan teknologi modern dan semangat kolaborasi. Beberapa teknologi yang kami gunakan antara lain HTML, CSS, JavaScript, dan <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet.js</a> untuk pemetaan interaktif. Kami juga berterima kasih kepada para kontributor cerita, narasumber, dan komunitas yang telah memberikan inspirasi dan dukungan.</p>
            </div>
      </section>
    `;
  }

  async afterRender() {
    // Inisialisasi Carousel untuk Galeri Cerita
    this._initStoryCarousel();
    this._initScrollAnimations();
  }

  _initStoryCarousel() {
    const carousel = document.getElementById('storyCarousel');
    if (!carousel) return;

    const items = carousel.querySelectorAll('.carousel-item');
    const prevButton = carousel.parentElement.querySelector('.carousel-control.prev');
    const nextButton = carousel.parentElement.querySelector('.carousel-control.next');
    let currentIndex = 0;
    let autoSlideInterval;

    function showItem(index) {
      items.forEach((item, i) => {
        item.classList.remove('active');
        if (i === index) {
          item.classList.add('active');
        }
      });
    }

    function nextItem() {
      currentIndex = (currentIndex + 1) % items.length;
      showItem(currentIndex);
    }

    function prevItem() {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      showItem(currentIndex);
    }

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => {
        prevItem();
        resetAutoSlide();
      });
      nextButton.addEventListener('click', () => {
        nextItem();
        resetAutoSlide();
      });
    }

    function startAutoSlide() {
      if (items.length > 1) {
        autoSlideInterval = setInterval(nextItem, 5000);
      }
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    showItem(currentIndex);
    startAutoSlide();

    carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    carousel.addEventListener('mouseleave', () => startAutoSlide());
  }

  _initScrollAnimations() {
    const animatedSections = document.querySelectorAll(
      '.about-section, .about-description, .about-title, .contribution-option, .developer-content'
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedSections.forEach(section => {
      observer.observe(section);
    });
  }
}

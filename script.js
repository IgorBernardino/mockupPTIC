(function(){
  'use strict';

  // ========== NAVEGAÇÃO SPA ==========
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(msg){
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function navigateTo(pageName){
    // Atualizar pages
    pages.forEach(p => {
      if (p.dataset.page === pageName){
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    // Atualizar nav links
    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.page === pageName);
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fechar mobile menu
    document.getElementById('navMenu').classList.remove('open');
  }

  // Handler universal pra qualquer LINK/BOTÃO com data-page
  // (apenas elementos clicáveis nominais — não a <section> que ENVOLVE a página)
  document.addEventListener('click', (e) => {
    // Procurar trigger entre elementos clicáveis (a, button, .nav-link, .nav-logo, .nav-cta, .ticket-btn)
    const trigger = e.target.closest(
      'a[data-page], button[data-page], .nav-link[data-page], ' +
      '.nav-logo[data-page], .nav-cta[data-page], ' +
      '.ticket-btn[data-page], .footer-col a[data-page]'
    );
    if (!trigger) return;
    e.preventDefault();
    const target = trigger.dataset.page;
    if (target) navigateTo(target);
  });

  // ========== SCROLL NAVBAR ==========
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ========== MENU MOBILE ==========
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('open');
  });

  // ========== FILTROS DE PÍLULA ==========
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    const parent = pill.parentElement;
    parent.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    showToast('Filtro: ' + pill.textContent.trim());
  });

  // Marvel/DC e tipo-row handlers movidos pra dentro do form (com validação)

  // ========== TICKET / VIP BUTTONS ==========
  // Botões de compra de ingresso (na página Ingressos) levam pro cadastro.
  // Botões com data-page próprio (ex: na seção Status da Home) ficam de fora —
  // a navegação normal do handler universal já cuida disso.
  document.addEventListener('click', (e) => {
    const ticketBtn = e.target.closest('.ticket-btn');
    if (ticketBtn && !ticketBtn.hasAttribute('data-page')){
      const card = ticketBtn.closest('.ticket-card');
      const name = card?.querySelector('.ticket-name')?.textContent || 'Ingresso';
      showToast('🎫 ' + name + ' selecionado!');
      setTimeout(() => navigateTo('cadastro'), 500);
    }
  });

  // Form submit movido para função dedicada abaixo

  // ========== COUNTDOWN ==========
  function updateCountdown(){
    const eventDate = new Date('2026-11-15T10:00:00').getTime();
    const now = Date.now();
    const diff = eventDate - now;
    if (diff < 0) return;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
    const secs = Math.floor((diff % (1000*60)) / 1000);
    const elDays = document.getElementById('cd-days');
    const elHrs = document.getElementById('cd-hours');
    const elMin = document.getElementById('cd-mins');
    const elSec = document.getElementById('cd-secs');
    if (elDays) elDays.textContent = days;
    if (elHrs) elHrs.textContent = String(hours).padStart(2,'0');
    if (elMin) elMin.textContent = String(mins).padStart(2,'0');
    if (elSec) elSec.textContent = String(secs).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  
  // ========== NEWS SLIDER (referência AnimeJapan) ==========
  const slides = document.querySelectorAll('.news-slide');
  const dots = document.querySelectorAll('.news-dots .dot');
  const prevBtn = document.getElementById('newsPrev');
  const nextBtn = document.getElementById('newsNext');
  let currentSlide = 0;
  let slideTimer;

  function goToSlide(idx) {
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    currentSlide = idx;
    resetAutoSlide();
  }

  function resetAutoSlide() {
    clearTimeout(slideTimer);
    slideTimer = setTimeout(() => goToSlide(currentSlide + 1), 7000);
  }

  if (slides.length > 0) {
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));
    resetAutoSlide();
  }

  // ========================================================
  // QR CODE VISUAL (gerador determinístico baseado em hash)
  // Gera um padrão visual estilo QR Code a partir dos dados.
  // Não é um QR Code real escaneável, mas é visualmente convincente
  // pra fins de protótipo. Pra produção, usar lib como qrcode.js.
  // ========================================================
  function gerarQRSVG(data, size) {
    size = size || 21;  // grid 21x21 (versão 1 QR)
    
    // Hash determinístico dos dados pra preencher os módulos
    function hash(s) {
      let h = 0x811c9dc5;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return h;
    }
    
    // Gerar matriz de módulos
    const grid = [];
    for (let y = 0; y < size; y++) {
      grid[y] = [];
      for (let x = 0; x < size; x++) {
        const seed = hash(data + ':' + x + ',' + y);
        grid[y][x] = (seed % 7) > 3;
      }
    }
    
    // Adicionar 3 finder patterns (cantos: topo-esq, topo-dir, baixo-esq)
    // Padrão clássico de QR: quadrado 7x7 com 5x5 dentro
    function drawFinder(gx, gy) {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const onBorder = x === 0 || x === 6 || y === 0 || y === 6;
          const onInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[gy + y][gx + x] = onBorder || onInner;
        }
      }
      // Área branca em volta (separator)
      for (let i = -1; i <= 7; i++) {
        if (gy + i >= 0 && gy + i < size) {
          if (gx - 1 >= 0) grid[gy + i][gx - 1] = false;
          if (gx + 7 < size) grid[gy + i][gx + 7] = false;
        }
        if (gx + i >= 0 && gx + i < size) {
          if (gy - 1 >= 0) grid[gy - 1][gx + i] = false;
          if (gy + 7 < size) grid[gy + 7][gx + i] = false;
        }
      }
    }
    drawFinder(0, 0);                  // top-left
    drawFinder(size - 7, 0);           // top-right
    drawFinder(0, size - 7);           // bottom-left
    
    // Timing patterns (linha e coluna alternada entre os finders)
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = (i % 2 === 0);
      grid[i][6] = (i % 2 === 0);
    }
    
    // Alignment pattern pequeno no canto inferior direito (5x5 com 3x3 dentro)
    const ax = size - 5;
    const ay = size - 5;
    if (ax >= 0 && ay >= 0) {
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const onBorder = x === 0 || x === 4 || y === 0 || y === 4;
          const onCenter = x === 2 && y === 2;
          grid[ay + y][ax + x] = onBorder || onCenter;
        }
      }
    }
    
    // Gerar SVG
    const cellSize = 8;
    const margin = 16;
    const dim = size * cellSize + 2 * margin;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" preserveAspectRatio="xMinYMin meet">`;
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;
    svg += `<g fill="#000000">`;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x]) {
          svg += `<rect x="${x * cellSize + margin}" y="${y * cellSize + margin}" width="${cellSize}" height="${cellSize}"/>`;
        }
      }
    }
    svg += `</g></svg>`;
    return svg;
  }

    // ========================================================
  // VALIDAÇÃO E SUBMIT DO FORM DE CADASTRO
  // ========================================================
  const form = document.getElementById('formCadastro');
  
  if (form) {
    // Prevenir auto-scroll do browser ao focar inputs
    // (browser rola pra trazer input à vista mesmo se já estiver visível,
    //  por causa da navbar fixa cobrir parte do topo)
    form.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('mousedown', (e) => {
        // Salvar posição atual antes do focus
        const currentScroll = window.scrollY;
        // Após focus, restaurar
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - currentScroll) > 5) {
            window.scrollTo({ top: currentScroll, behavior: 'instant' });
          }
        });
      });
      // Também prevenir o focus de causar scroll
      inp.addEventListener('focus', (e) => {
        // preventScroll é uma opção do focus() — se chegamos aqui, já tá focado
        // mas garante que ANY scroll-into-view do navegador seja desfeito
        const currentScroll = window.scrollY;
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - currentScroll) > 5) {
            window.scrollTo({ top: currentScroll, behavior: 'instant' });
          }
        });
      });
    });
    // Marvel/DC selector
    const universoEl = document.getElementById('fUniverso');
    let universoValue = null;
    universoEl.addEventListener('click', (e) => {
      const card = e.target.closest('.mvdc-card');
      if (!card) return;
      universoEl.querySelectorAll('.mvdc-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      universoValue = card.dataset.value;
      clearError('fUniverso');
    });

    // Tipo selector
    const tipoEl = document.getElementById('fTipo');
    let tipoValue = null;
    tipoEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tipo-row');
      if (!row) return;
      tipoEl.querySelectorAll('.tipo-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      tipoValue = row.dataset.value;
      clearError('fTipo');
    });

    // Helpers de erro
    function setError(field, msg) {
      const errEl = document.querySelector(`.form-error[data-for="${field}"]`);
      if (errEl) errEl.textContent = msg;
      const inp = document.getElementById(field) || document.querySelector(`#${field}`);
      if (inp) inp.closest('.form-group')?.classList.add('has-error');
    }
    function clearError(field) {
      const errEl = document.querySelector(`.form-error[data-for="${field}"]`);
      if (errEl) errEl.textContent = '';
      const inp = document.getElementById(field) || document.querySelector(`#${field}`);
      if (inp) inp.closest('.form-group')?.classList.remove('has-error');
      const wrap = document.getElementById(field);
      if (wrap) wrap.closest('.form-group')?.classList.remove('has-error');
    }

    // Limpar erro ao digitar
    ['fNome','fEmail','fTel','fIg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearError(id));
    });

    // Máscara simples de telefone enquanto digita
    const fTel = document.getElementById('fTel');
    if (fTel) {
      fTel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (v.length > 6) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        } else if (v.length > 0) {
          v = v.replace(/^(\d{0,2}).*/, '($1');
        }
        e.target.value = v;
      });
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Limpar erros anteriores
      ['fNome','fEmail','fTel','fIg','fUniverso','fTipo'].forEach(clearError);
      
      const nome = document.getElementById('fNome').value.trim();
      const email = document.getElementById('fEmail').value.trim();
      const tel = document.getElementById('fTel').value.trim();
      const ig = document.getElementById('fIg').value.trim();
      
      let hasError = false;
      
      // Nome: mínimo 3 caracteres, deve ter ao menos sobrenome
      if (!nome) {
        setError('fNome', 'Por favor, preencha seu nome.');
        hasError = true;
      } else if (nome.length < 3) {
        setError('fNome', 'Nome muito curto (mínimo 3 caracteres).');
        hasError = true;
      } else if (!nome.includes(' ')) {
        setError('fNome', 'Por favor, informe nome completo (nome + sobrenome).');
        hasError = true;
      }
      
      // Email: formato válido
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!email) {
        setError('fEmail', 'Por favor, preencha seu e-mail.');
        hasError = true;
      } else if (!emailRe.test(email)) {
        setError('fEmail', 'E-mail inválido. Verifique o formato.');
        hasError = true;
      }
      
      // Telefone: deve ter 10 ou 11 dígitos
      const telDigits = tel.replace(/\D/g, '');
      if (!tel) {
        setError('fTel', 'Por favor, preencha seu telefone.');
        hasError = true;
      } else if (telDigits.length < 10 || telDigits.length > 11) {
        setError('fTel', 'Telefone deve ter 10 ou 11 dígitos com DDD.');
        hasError = true;
      }
      
      // Instagram (opcional): se preencheu, deve começar com @ ou ser válido
      if (ig && ig.length > 0) {
        const igClean = ig.startsWith('@') ? ig.slice(1) : ig;
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(igClean)) {
          setError('fIg', 'Instagram inválido. Use letras, números, "_" ou ".".');
          hasError = true;
        }
      }
      
      // Universo
      if (!universoValue) {
        setError('fUniverso', 'Escolha entre Marvel ou DC.');
        hasError = true;
      }
      
      // Tipo
      if (!tipoValue) {
        setError('fTipo', 'Selecione o tipo de participação.');
        hasError = true;
      }
      
      if (hasError) {
        // Scroll até primeiro erro
        const firstError = document.querySelector('.form-group.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast('⚠ Verifique os campos destacados');
        return;
      }
      
      // Tudo OK — gerar ticket
      const dados = {
        nome: nome,
        email: email,
        telefone: tel,
        instagram: ig ? (ig.startsWith('@') ? ig : '@' + ig) : 'não informado',
        universo: universoValue,
        tipo: tipoValue,
        timestamp: Date.now()
      };
      
      gerarTicket(dados);
    });
  }

  // ========================================================
  // GERAR E EXIBIR TICKET COM QR CODE
  // ========================================================
  function gerarHunterID(dados) {
    // Gera ID determinístico baseado nos dados
    const seed = dados.email + dados.nome + dados.timestamp;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);
    const partA = String(hash % 10000).padStart(4, '0');
    const partB = String(Math.abs(hash * 31) % 10000).padStart(4, '0');
    return `CSP-${partA}-${partB}`;
  }
  
  function gerarTicket(dados) {
    const hunterId = gerarHunterID(dados);
    
    // Conteúdo do QR Code (JSON com info do cadastro + ID)
    const qrPayload = JSON.stringify({
      event: 'CosplayCon Brasil 2026',
      id: hunterId,
      name: dados.nome,
      type: dados.tipo,
      universe: dados.universo,
      date: '2026-11-15'
    });
    
    // Gerar Mini QR no convite (único QR agora)
    const conviteQR = document.getElementById('conviteQR');
    if (conviteQR) {
      try {
        const svg = gerarQRSVG(qrPayload, 21);
        conviteQR.innerHTML = svg;
        console.log('✓ QR Code do convite gerado (' + svg.length + ' chars)');
      } catch (err) {
        console.error('❌ Erro ao gerar QR do convite:', err);
        conviteQR.innerHTML = '<div style="color:#dc2626;font-size:9px;text-align:center;padding:8px">QR err</div>';
      }
    }
    
    // === POPULAR O CONVITE ===
    popularConvite(dados, hunterId);
    
    // Mostrar modal
    const modal = document.getElementById('ticketModal');
    if (modal) {
      if (window.__openTicketModal) {
        window.__openTicketModal();
      } else {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }
    
    showToast('✓ Hunter ID gerado: ' + hunterId);
    
    // Guardar pro download
    window.__hunterId = hunterId;
  }

  // ========================================================
  // POPULAR CONVITE COM IMAGEM POR TIPO
  // ========================================================
  // Mapeamento: tipo de cadastro → imagem do convite + estilo da tag
  // IMPORTANTE: trocar 'images/gamernato.jpg' pelo arquivo que você quiser pra cada tipo
  const CONVITE_CONFIG = {
    'Visitante': {
      imagem: 'images/berserk.jpg',
      tagText: '★ VISITANTE',
      tagClass: ''  // ciano (default)
    },
    'Concurso Cosplay': {
      imagem: 'images/jjk.jpg',
      tagText: '★ COMPETIDOR',
      tagClass: 'gold'
    },
    'Cospobre': {
      imagem: 'images/solo.jpg',
      tagText: '★ COSPOBRE',
      tagClass: 'purple'
    },
    'Expositor': {
      imagem: 'images/solo.jpg',
      tagText: '★ EXPOSITOR',
      tagClass: 'red'
    }
  };

  function popularConvite(dados, hunterId) {
    const config = CONVITE_CONFIG[dados.tipo] || CONVITE_CONFIG['Visitante'];
    
    // Imagem hero
    const hero = document.getElementById('conviteHero');
    if (hero) {
      hero.style.backgroundImage = `url('${config.imagem}')`;
    }
    
    // Tag de categoria
    const tag = document.getElementById('conviteTag');
    if (tag) {
      tag.textContent = config.tagText;
      tag.className = 'convite-tag ' + config.tagClass;
    }
    
    // Nome do hunter (só primeiro nome + sobrenome curto pra caber)
    const nomeEl = document.getElementById('conviteNome');
    if (nomeEl) {
      const partes = dados.nome.trim().split(' ');
      const nomeCurto = partes.length > 1
        ? `${partes[0]} ${partes[partes.length - 1]}`
        : dados.nome;
      nomeEl.textContent = nomeCurto;
    }
    
    // Hunter ID no convite
    const hunterEl = document.getElementById('conviteHunterId');
    if (hunterEl) hunterEl.textContent = hunterId;
  }
  
  // Fechar modal
  const ticketModal = document.getElementById('ticketModal');
  if (ticketModal) {
    const navbar = document.getElementById('navbar');
    function openModal() {
      ticketModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.zIndex = '1';  // rebaixa navbar
    }
    function closeModal() {
      ticketModal.classList.remove('show');
      document.body.style.overflow = '';
      if (navbar) navbar.style.zIndex = '';  // restaura
    }
    window.__openTicketModal = openModal;  // exposed para gerarTicket usar
    document.getElementById('ticketClose')?.addEventListener('click', closeModal);
    document.getElementById('ticketDone')?.addEventListener('click', closeModal);
    ticketModal.querySelector('.ticket-backdrop')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && ticketModal.classList.contains('show')) closeModal();
    });
  }
  
  // Download do convite — gera PNG com a imagem do convite inteiro
  // Usa html2canvas pra capturar o card como imagem
  document.getElementById('ticketDownload')?.addEventListener('click', async () => {
    const card = document.getElementById('conviteCard');
    if (!card) {
      showToast('⚠ Convite não encontrado');
      return;
    }

    // Verificar se a lib carregou
    if (typeof html2canvas !== 'function') {
      showToast('⚠ Aguarde, gerador de imagem carregando...');
      console.warn('html2canvas ainda não carregou. Tentando download alternativo (SVG do QR).');
      // Fallback: baixar SVG do QR Code
      const qrSvg = document.querySelector('#conviteQR svg');
      if (qrSvg) {
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CosplayCon-${window.__hunterId || 'convite'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }

    // Feedback imediato
    const btn = document.getElementById('ticketDownload');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Gerando imagem...';
    btn.disabled = true;
    showToast('⏳ Gerando imagem do convite...');

    try {
      // html2canvas opções pra máxima qualidade
      const canvas = await html2canvas(card, {
        backgroundColor: '#050510',     // fundo deep do site
        scale: 2,                        // 2x pra alta resolução
        useCORS: true,                   // permitir imagens cross-origin
        allowTaint: false,
        logging: false,
        imageTimeout: 5000,
      });

      // Converter canvas pra blob e baixar
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Falha ao gerar blob da imagem');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CosplayCon-Convite-${window.__hunterId || 'convite'}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✓ Convite baixado!');
      }, 'image/png', 1.0);

    } catch (err) {
      console.error('Erro ao gerar imagem do convite:', err);
      showToast('❌ Erro ao gerar imagem. Tente novamente.');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });


  console.log('⚡ CosplayCon Brasil 2026 site carregado');
})();
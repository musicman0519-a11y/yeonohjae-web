    /* ===== SHARED STORE (front ↔ admin.html via localStorage) ===== */
    window.KK = {
      ns:'kkeut:',
      get(k, def){ try{ const v=localStorage.getItem(this.ns+k); return v!==null? JSON.parse(v): def; }catch(e){ return def; } },
      set(k, val){ try{ localStorage.setItem(this.ns+k, JSON.stringify(val)); return true; }catch(e){ return false; } },
    };
    tailwind.config = { theme: { extend: {
      fontFamily: {
        sans:['Pretendard','system-ui','sans-serif'],
        serif:['"Cormorant Garamond"','serif'],
        display:['Marcellus','serif'],
        krhead:['"Gothic A1"','Pretendard','sans-serif'],
      },
      colors: {
        pink:'#4a5d4e', pinkstrong:'#3d4e41', pinkneon:'#6e7f64', pinksoft:'#e6dcd2',
        beige:'#e6dcd2', cream:'#f3eee8', bglight:'#f4efe9',
        dark:'#2f343a', char2:'#3a4047', terra:'#4a5d4e',
        ink:'#2f343a', muted:'#8a857e',
      }
    }}}
  

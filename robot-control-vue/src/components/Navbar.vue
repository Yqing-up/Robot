<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="back-btn" @click="goHome">← 返回首页</button>
      <div class="logo">视觉系统控制中心</div>
    </div>

    <!-- 移动端汉堡菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- 导航链接 -->
    <ul class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
      <li><a href="javascript:void(0)" @click="openMotionDialog">运动检测</a></li>
      <li><a href="javascript:void(0)" @click="openTongueDialog">舌苔检测</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isMobileMenuOpen = ref(false);

function goHome() {
  router.push('/');
  closeMobileMenu();
}

function openMotionDialog() {
  window.dispatchEvent(new Event('open-motion-dialog'));
  closeMobileMenu();
}

function openTongueDialog() {
  window.dispatchEvent(new Event('open-tongue-dialog'));
  closeMobileMenu();
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
  height: 64px;
  background: rgba(10, 20, 40, 0.92);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 2px solid #1a4b7a;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}
.navbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.back-btn {
  margin-right: clamp(0.5rem, 3vw, 1.5rem);
  padding: 0.5rem clamp(0.8rem, 2vw, 1.4rem);
  font-size: clamp(0.85rem, 2vw, 1rem);
  font-family: 'Microsoft YaHei', 'Orbitron', sans-serif;
  font-weight: 600;
  color: #2196f3;
  background: linear-gradient(90deg, rgba(20,30,50,0.8), rgba(30,60,120,0.6));
  border: 1.5px solid #1976d2;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: all 0.3s ease;
  outline: none;
  white-space: nowrap;
}
.back-btn:hover {
  background: linear-gradient(90deg, #0d223a 60%, #1976d2 100%);
  color: #42a5f5;
  box-shadow: 0 4px 16px rgba(33,150,243,0.10);
}
.logo {
  font-size: clamp(1.2rem, 4vw, 2rem);
  font-weight: 700;
  font-family: 'Microsoft YaHei', 'Orbitron', sans-serif;
  letter-spacing: clamp(1px, 0.5vw, 2px);
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-links li {
  font-size: 1.1rem;
}
.nav-links a {
  color: #2196f3;
  text-decoration: none;
  transition: color 0.2s;
  font-family: 'Microsoft YaHei', 'Orbitron', sans-serif;
  font-weight: 500;
}
.nav-links a.router-link-active {
  color: #1976d2;
  font-weight: bold;
}
.nav-links a:hover {
  color: #42a5f5;
}

/* 移动端汉堡菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(33, 150, 243, 0.1);
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: #2196f3;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* 响应式媒体查询 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(10, 20, 40, 0.95);
    backdrop-filter: blur(12px);
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    border-top: 1px solid #1a4b7a;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links li {
    text-align: center;
  }

  .nav-links a {
    display: block;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .nav-links a:hover {
    background: rgba(33, 150, 243, 0.1);
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 0.5rem;
  }

  .back-btn {
    margin-right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .logo {
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
}
</style>
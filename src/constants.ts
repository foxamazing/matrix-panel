
import { AppConfig, SearchEngine } from './types';

export const MUSIC_API_URL = 'https://music-api.gdstudio.xyz/api.php';

export const MUSIC_SOURCES = [
  { id: 'netease', name: '网易云', icon: 'https://api.iconify.design/ri:netease-cloud-music-fill.svg?color=%23dd001b' },
];

export const TRANSLATIONS = {
  zh: {
    common: {
      save: "保存设置",
      cancel: "取消",
      confirm: "确认执行",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      loading: "正在处理...",
      unknown: "未知",
      search: "在此搜索...",
      webSearch: "在 {engine} 中搜索...",
      musicSearch: "搜索{source}音乐...",
      noData: "暂无相关数据",
      layout: "布局调整",
      done: "完成"
    },
    auth: {
      adminLogin: "系统登录",
      loginDesc: "为了您的数据安全，访问设置需要验证管理员身份。",
      accountPlaceholder: "请输入管理员账号",
      passwordPlaceholder: "请输入管理员密码",
      passwordError: "账号或密码不正确，请重试",
      usernameError: "请输入账号",
      unlock: "解锁系统",
      logout: "退出登录",
      unlocked: "已解锁",
      locked: "已锁定",
      defaultPass: "默认账号: admin@sun.cc / 密码: 12345678",
      lockScreenTitle: "访问已锁定",
      enterAccount: "请输入账号",
      enterPass: "请输入密码",
      pressEnter: "按回车键进入系统"
    },
    nav: {
      settings: "个性化设置",
      lock: "立即锁屏",
      lang: "English"
    },
    settings: {
      title: "系统个性化设置",
      tabs: {
        basic: "基础功能",
        desktop: "壁纸与个性化",
        security: "用户与安全",
        music: "音乐播放器",
        search: "搜索引擎"
      },
      basic: {
        title: "基础功能",
        siteInfo: "站点信息",
        siteTitle: "网站标题",
        siteTitlePlaceholder: "显示在浏览器标签页",
        siteLogo: "网站 Logo",
        siteFavicon: "网页图标 (Favicon)",
        upload: "点击上传",
        themeColor: "主题色调",
        displayStyle: "显示风格",
        darkMode: "深色模式",
        lightMode: "浅色模式",
        pixelMode: "像素字体",
        pixelTitle: "标题像素字体",
        pixelTime: "时间像素字体",
        clockSettings: "时钟显示",
        showDate: "显示日期",
        showSeconds: "显示秒钟",
        cardOpacity: "卡片透明度",
        reset: "重置"
      },
      emby: {
        title: "Emby",
        enable: "启用影视封面滚动",
        serverUrl: "服务器地址",
        apiKey: "API Key",
        userId: "用户 ID",
        limit: "封面数量",
        height: "封面高度",
        speed: "滚动速度",
        refreshSeconds: "刷新间隔(秒)"
      },
      desktop: {
        title: "壁纸与个性化",
        desktopTab: "桌面壁纸",
        lockTab: "锁屏壁纸",
        bgMode: "背景类型",
        image: "图片",
        video: "视频",
        uploadImg: "上传图片",
        uploadVideo: "上传视频",
        videoUrl: "或输入视频直链",
        clear: "清除壁纸",
        preview: "效果预览 & 调整",
        previewMode: "预览视角",
        modeDesktop: "电脑端 (横屏)",
        modeMobile: "手机端 (竖屏)",
        adjust: "位置调整",
        blur: "背景模糊",
        scale: "缩放比例",
        dragTip: "提示: 在预览图中拖动可调整显示位置"
      },
      security: {
        userManagement: "用户账号管理",
        addUser: "添加新用户",
        editUser: "编辑用户",
        deleteUser: "删除用户",
        publicVisitUser: "公共访问用户",
        publicVisitUserDesc: "未登录时以该用户身份展示面板数据",
        publicVisitUserNone: "关闭公共访问",
        role: "权限角色",
        roleAdmin: "管理员 (完全权限)",
        roleGuest: "访客 (仅查看)",
        cannotDemoteSelf: "不能将当前管理员账户设置为访客",
        username: "登录账号",
        displayName: "显示昵称",
        password: "登录密码",
        passwordPlaceholder: "留空则不修改密码",
        testLock: "锁屏功能测试",
        testLockDesc: "手动触发“外部网络锁定”模式以预览锁屏效果。",
        danger: "危险操作区域",
        reset: "重置所有数据",
        resetDesc: "清除所有用户设置、上传壁纸和本地存储，并恢复初始状态（仅管理员可用）",
        enterLock: "立即进入锁屏",
        lastAdminWarn: "无法删除系统唯一的管理员账户"
      },
      music: {
        title: "播放器配置",
        enable: "启用桌面播放器",
        playlist: "播放列表管理",
        add: "添加歌曲",
        import: "导入...",
        manual: "手动添加",
        smartMatch: "智能匹配：仅需输入歌名，自动获取封面歌词"
      },
      search: {
        title: "自定义搜索引擎",
        add: "添加新引擎",
        name: "引擎名称",
        url: "搜索 URL 查询串",
        icon: "图标 URL"
      }
    }
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      loading: "Loading...",
      unknown: "Unknown",
      search: "Search...",
      webSearch: "Search in {engine}...",
      musicSearch: "Search {source}...",
      noData: "No Data",
      layout: "Arrange Layout",
      done: "Done"
    },
    auth: {
      adminLogin: "System Login",
      loginDesc: "Identity verification is required to access settings.",
      accountPlaceholder: "Enter Username",
      passwordPlaceholder: "Enter Password",
      passwordError: "Incorrect username or password",
      usernameError: "Enter username",
      unlock: "Unlock System",
      logout: "Logout",
      unlocked: "Unlocked",
      locked: "Locked",
      defaultPass: "Default: admin@sun.cc / 12345678",
      lockScreenTitle: "External Access Locked",
      enterAccount: "Enter Username",
      enterPass: "Enter Password",
      pressEnter: "Press Enter to Unlock"
    },
    nav: {
      settings: "Settings",
      lock: "Lock Screen",
      lang: "中文"
    },
    settings: {
      title: "Settings",
      tabs: {
        basic: "Basic Features",
        desktop: "Desktop & Lock",
        security: "Security",
        music: "Music",
        search: "Search"
      },
      basic: {
        title: "Basic Features",
        siteInfo: "Site Info",
        siteTitle: "Site Title",
        siteTitlePlaceholder: "Shown in browser tab",
        siteLogo: "Site Logo",
        siteFavicon: "Favicon",
        upload: "Upload",
        themeColor: "Theme Color",
        displayStyle: "Display Style",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        pixelMode: "Pixel Font",
        pixelTitle: "Pixel Title",
        pixelTime: "Pixel Time",
        clockSettings: "Clock Settings",
        showDate: "Show Date",
        showSeconds: "Show Seconds",
        cardOpacity: "Card Opacity",
        reset: "Reset"
      },
      emby: {
        title: "Emby",
        enable: "Enable cover carousel",
        serverUrl: "Server URL",
        apiKey: "API Key",
        userId: "User ID",
        limit: "Cover count",
        height: "Cover height",
        speed: "Scroll speed",
        refreshSeconds: "Refresh interval (s)"
      },
      desktop: {
        title: "Wallpaper & Customization",
        desktopTab: "Desktop",
        lockTab: "Lock Screen",
        bgMode: "Background Type",
        image: "Image",
        video: "Video",
        uploadImg: "Upload Image",
        uploadVideo: "Upload Video",
        videoUrl: "Or Video URL",
        clear: "Clear",
        preview: "Preview & Adjust",
        previewMode: "Preview Mode",
        modeDesktop: "Desktop (Landscape)",
        modeMobile: "Mobile (Portrait)",
        adjust: "Adjustment",
        blur: "Blur",
        scale: "Scale",
        dragTip: "Tip: Drag the preview to adjust position"
      },
      security: {
        userManagement: "User Management",
        addUser: "Add User",
        editUser: "Edit User",
        deleteUser: "Delete User",
        publicVisitUser: "Public Visit User",
        publicVisitUserDesc: "When not logged in, browse as this user",
        publicVisitUserNone: "Disable public visit",
        role: "Role",
        roleAdmin: "Administrator",
        roleGuest: "Guest",
        cannotDemoteSelf: "You can't change your own role to Guest",
        username: "Username",
        displayName: "Display Name",
        password: "Password",
        passwordPlaceholder: "Leave empty to keep current",
        testLock: "Test External Lock",
        testLockDesc: "Manually trigger external lock mode to test.",
        danger: "Danger Zone",
        reset: "Reset All",
        resetDesc: "Clear all user settings, uploaded wallpapers and local data, then restore defaults (Admin Only)",
        enterLock: "Lock Now (Test)",
        lastAdminWarn: "Cannot delete the last administrator"
      },
      music: {
        title: "Player Settings",
        enable: "Enable Player",
        playlist: "Playlist",
        add: "Add Track",
        import: "Upload Audio",
        manual: "Manual Input",
        smartMatch: "Just enter name, auto-match info"
      },
      search: {
        title: "Custom Search Engines",
        add: "Add Engine",
        name: "Name",
        url: "Search URL",
        icon: "Icon URL"
      }
    }
  }
};

export const DEFAULT_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q={q}',
    icon: 'https://api.iconify.design/logos:google-icon.svg',
  },
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd={q}',
    icon: 'https://api.iconify.design/simple-icons:baidu.svg?color=%232319dc',
  },
  {
    id: 'bing',
    name: '必应',
    url: 'https://www.bing.com/search?q={q}',
    icon: 'https://api.iconify.design/logos:bing.svg',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q={q}',
    icon: 'https://api.iconify.design/simple-icons:github.svg',
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  siteTitle: 'Matrix-Panel',
  siteLogo: null,
  siteFavicon: null,
  language: 'zh',

  // 默认管理员用户
  users: [
    {
      id: 'default-admin',
      username: 'admin',
      name: '管理员',
      avatar: null,
      role: 'admin'
    }
  ],

  // 锁屏默认配置
  lockBgImage: null,
  lockBgVideo: null,
  lockBgType: 'image',
  lockBgPosition: { x: 50, y: 50, scale: 1 },
  lockBgBlur: 10,

  // 桌面默认配置
  desktopBgPosition: { x: 50, y: 50, scale: 1 },

  isPixelMode: false,
  clockTitlePixel: false,
  clockTimePixel: false,
  showDate: true,
  showSeconds: false,
  customFont: undefined,
  themeColor: 'zinc',
  bgType: 'image',
  bgImage: null,
  bgVideo: null,
  bgOpacity: 1.0,
  bgBlur: 0,
  appAreaOpacity: 0.05,
  appAreaBlur: 20,
  isDarkMode: true,
  statsCardOrder: ['cpu', 'ram', 'netUp', 'netDown'],
  hiddenStatsCards: ['disk', 'temp', 'gpu', 'gpuTemp', 'power'],
  musicConfig: {
    enabled: true,
    autoplay: false,
    volume: 0.5,
    mode: 'loop',
    quality: '320',
    lyricStyles: {
      fontSize: 22,
      blur: 2,
      showTranslation: true
    },
    playlist: [
      {
        id: 'default-0',
        name: '愿戴荣光坠入天渊',
        artist: '', // 自动搜索
        url: '', // 自动获取
        cover: '', // 自动获取
        source: 'netease',
        meta: {}
      },
      {
        id: 'default-1',
        name: '起风了',
        artist: '买辣椒也用券',
        url: '', // 自动获取
        cover: '', // 自动获取
        source: 'netease',
        meta: {}
      }
    ]
  },
  emby: {
    enabled: false,
    serverUrl: '',
    apiKey: '',
    userId: '',
    limit: 30,
    height: 140,
    speed: 60,
    refreshSeconds: 600
  },
  searchEngineId: 'google',
  appGroups: [
    {
      id: 'default-1',
      name: '媒体服务',
      apps: [
        { id: 'app-1', name: 'Jellyfin', url: '#', icon: 'https://api.iconify.design/simple-icons:jellyfin.svg?color=%23a855f7' },
        { id: 'app-2', name: 'Docker', url: '#', icon: 'https://api.iconify.design/logos:docker-icon.svg' },
        { id: 'app-3', name: 'OpenWrt', url: '#', icon: 'https://api.iconify.design/mdi:router-wireless.svg' },
      ],
    },
  ],
  customEngines: [],
};

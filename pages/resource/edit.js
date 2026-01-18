import { 
  merchantResourceDetailApi, 
  merchantResourceBaseUpdateApi, 
  merchantResourceContentUpdateApi 
} from '../../api/profile.js';

const ensureLogin = () => {
  const token = wx.getStorageSync('merchant_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return false;
  }
  return true;
};

Page({
  data: {
    loading: false,
    saving: false,
    
    // 资源详情
    resource: null,
    
    // 基础信息编辑
    editBase: false,
    baseForm: {
      name: '',
      coverImg: '',
      latitude: '',
      longitude: '',
    },
    
    // 内容编辑
    editContent: false,
    contentBlocks: [],
  },

  onLoad() {
    if (!ensureLogin()) return;
    this.loadResourceDetail();
  },

  async loadResourceDetail() {
    this.setData({ loading: true });
    try {
      const res = await merchantResourceDetailApi();
      const data = res.data || {};
      
      // 过滤无效的封面图 URL
      const coverImg = this.filterInvalidImageUrl(data.coverImg);
      
      // 过滤内容中的无效图片 URL
      let content = Array.isArray(data.content) ? data.content : [];
      content = content.map(item => {
        if (item.type === 'image' && item.value) {
          const validUrl = this.filterInvalidImageUrl(item.value);
          if (!validUrl) {
            // 如果图片 URL 无效，可以选择跳过或标记为无效
            return null;
          }
          return { ...item, value: validUrl };
        }
        return item;
      }).filter(item => item !== null); // 移除无效的图片内容块
      
      this.setData({
        resource: {
          ...data,
          coverImg: coverImg || null, // 如果无效则设为 null，WXML 中 wx:if 会隐藏
        },
        baseForm: {
          name: data.name || '',
          coverImg: coverImg || '',
          latitude: data.latitude ? String(data.latitude) : '',
          longitude: data.longitude ? String(data.longitude) : '',
        },
        contentBlocks: content,
      });
    } catch (e) {
      console.log('load resource detail failed', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 验证并过滤无效的图片 URL
  filterInvalidImageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    // 过滤掉 example.com 等示例域名
    if (url.includes('example.com') || url.includes('placeholder') || url.includes('test')) {
      return null;
    }
    // 基本 URL 格式验证
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    return url;
  },

  // 图片加载失败处理（静默处理，避免控制台报错）
  onImageError(e) {
    // 静默处理，不显示错误提示
    // 可以选择隐藏该图片元素
    const { url } = e.currentTarget.dataset || {};
    if (url) {
      console.log('Image load failed (silent):', url);
    }
  },

  // 基础信息编辑
  toggleEditBase() {
    this.setData({ editBase: !this.data.editBase });
  },

  onNameInput(e) {
    this.setData({ 'baseForm.name': (e.detail && e.detail.value) || '' });
  },

  onCoverImgInput(e) {
    this.setData({ 'baseForm.coverImg': (e.detail && e.detail.value) || '' });
  },

  onLatitudeInput(e) {
    this.setData({ 'baseForm.latitude': (e.detail && e.detail.value) || '' });
  },

  onLongitudeInput(e) {
    this.setData({ 'baseForm.longitude': (e.detail && e.detail.value) || '' });
  },

  async onSaveBase() {
    if (!ensureLogin()) return;
    const { baseForm, saving } = this.data;
    if (saving) return;

    if (!baseForm.name || !baseForm.name.trim()) {
      wx.showToast({ title: '资源名称不能为空', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    try {
      const payload = {
        name: baseForm.name.trim(),
      };
      if (baseForm.coverImg) payload.coverImg = baseForm.coverImg.trim();
      if (baseForm.latitude) {
        const lat = Number(baseForm.latitude);
        if (!isNaN(lat)) payload.latitude = lat;
      }
      if (baseForm.longitude) {
        const lng = Number(baseForm.longitude);
        if (!isNaN(lng)) payload.longitude = lng;
      }

      await merchantResourceBaseUpdateApi(payload);
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ editBase: false });
      await this.loadResourceDetail();
    } catch (e) {
      console.log('update resource base failed', e);
    } finally {
      this.setData({ saving: false });
    }
  },

  // 内容编辑
  toggleEditContent() {
    this.setData({ editContent: !this.data.editContent });
  },

  addTextBlock() {
    this.addContentBlock('text');
  },

  addImageBlock() {
    this.addContentBlock('image');
  },

  addVideoBlock() {
    this.addContentBlock('video');
  },

  addContentBlock(type) {
    const blocks = this.data.contentBlocks || [];
    blocks.push({ type, value: '' });
    this.setData({ contentBlocks: blocks });
  },

  removeContentBlock(e) {
    const { index } = e.currentTarget.dataset;
    const blocks = this.data.contentBlocks || [];
    blocks.splice(index, 1);
    this.setData({ contentBlocks: blocks });
  },

  onContentValueInput(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    const blocks = this.data.contentBlocks || [];
    if (blocks[index]) {
      blocks[index].value = value || '';
      this.setData({ contentBlocks: blocks });
    }
  },

  async onSaveContent() {
    if (!ensureLogin()) return;
    const { contentBlocks, saving } = this.data;
    if (saving) return;

    // 验证内容
    const validBlocks = (contentBlocks || []).filter(block => {
      return block && block.type && block.value && block.value.trim();
    });

    if (validBlocks.length === 0) {
      wx.showToast({ title: '请至少添加一个内容块', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    try {
      await merchantResourceContentUpdateApi(validBlocks);
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ editContent: false });
      await this.loadResourceDetail();
    } catch (e) {
      console.log('update resource content failed', e);
    } finally {
      this.setData({ saving: false });
    }
  },
});


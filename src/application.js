// @ts-check

import onChange from 'on-change';

// HELPERS
function getElementId(element) {
  return element.getAttribute('id');
}

function getContentItemId(listGroupTabId) {
  const [keyword1, keyword2] = listGroupTabId.split('-');

  return `${keyword1}-${keyword2}`;
}

// MODEL
class Model {
  constructor() {
    this.state = initializeStateFromDOM();
    this.watchedState = onChange(this.state, handleChange);
  }

  setActiveTabId(listGroupId, listGroupTabId) {
    const listGroup = this.watchedState[listGroupId];
    listGroup.active.tab = listGroupTabId;
  }

  setActiveContentItemId(listGroupId, listGroupContentItemId) {
    const listGroup = this.watchedState[listGroupId];
    listGroup.active.contentItem = listGroupContentItemId;
  }

  getAllListGroupIds() {
    return Object.keys(this.watchedState);
  }

  getListGroupData() {
    return this.watchedState;
  }
}

function initializeStateFromDOM() {
  const listGroupEls = document.querySelectorAll('.list-group');
  const listGroupData = {};

  listGroupEls.forEach(listGroup => {
    const listGroupId = getElementId(listGroup);
    const listGroupTab = listGroup.firstElementChild;
    const tabId = getElementId(listGroupTab);
    const contentItemId = getContentItemId(tabId);

    listGroupData[listGroupId] = {
      active: {
        tab: tabId,
        contentItem: contentItemId,
      },
    };
  });

  return listGroupData;
}

// VIEW
const renderOptions = {
  tab: renderTab,
  contentItem: renderContentItem,
};

function handleChange(path, value, previousValue) {
  const type = path.split('.').slice(-1);

  renderOptions[type](value, previousValue);
}

function addHandlerToListGroups(handler, model) {
  const listGroupIds = model.getAllListGroupIds();

  listGroupIds.forEach(listGroupId => {
    const listGroupEl = document.getElementById(listGroupId);

    listGroupEl?.addEventListener('click', handler.bind(null, model));
  });
}

function renderTab(activeElId, prevElId = null) {
  if (prevElId) {
    const prevTabEl = document.getElementById(prevElId);
    prevTabEl?.classList.remove('active');
  }

  const activeTabEl = document.getElementById(activeElId);
  activeTabEl?.classList.add('active');
}

function renderContentItem(activeElId, prevElId = null) {
  if (prevElId) {
    const prevContentItemEl = document.getElementById(prevElId);
    prevContentItemEl?.classList.remove('active', 'show');
  }

  const activeContentItemEl = document.getElementById(activeElId);
  activeContentItemEl?.classList.add('active', 'show');
}

// CONTROLLER
function init(model) {
  const watchedData = model.getListGroupData();
  const initialGroups = Object.keys(watchedData);

  initialGroups.forEach(group => {
    const { tab, contentItem } = watchedData[group].active;

    renderTab(tab);
    renderContentItem(contentItem);
  });
}

function handleListGroupSelect(model, e) {
  const clickedEl = e.target;

  if (!clickedEl.matches('.list-group-item')) return;

  const listGroupEl = clickedEl.closest('.list-group');
  const listGroupId = getElementId(listGroupEl);
  const activeTabId = getElementId(clickedEl);
  const activeContentItemId = getContentItemId(activeTabId);

  model.setActiveTabId(listGroupId, activeTabId);
  model.setActiveContentItemId(listGroupId, activeContentItemId);
}

export default function app() {
  const model = new Model();

  init(model);

  addHandlerToListGroups(handleListGroupSelect, model);
}



// END

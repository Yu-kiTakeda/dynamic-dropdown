/**
 * 動的ドロップダウン
 */
import { MobileDropdown } from "kintone-ui-component/lib/mobile/dropdown";
(function(PLUGIN_ID) {
  'use strict';
  
  if(!PLUGIN_ID) return;
  const configObj = kintone.plugin.app.getConfig(PLUGIN_ID);
  
  const options = configObj.options ? JSON.parse(configObj.options) : [];

  const events = [
    'mobile.app.record.create.show', 'mobile.app.record.edit.show',
    ...options.filter(opt => opt.field_from).map(opt => opt.field_from).reduce((events, field) => events.concat(['mobile.app.record.create.change.', 'mobile.app.record.edit.change.'].map(e => e + field)), [])
  ];

  let dropdowns = [];
  console.log(events);
  kintone.events.on(events, event => {
    const record = event.record;
    //イベントタイプのラストワード
    const eTypeLastWord = event.type.substring(event.type.lastIndexOf('.') + 1);
    console.log(eTypeLastWord);
    if(eTypeLastWord === 'show') {
      dropdowns = options.filter(option => kintone.mobile.app.record.getSpaceElement(option.putSpaceId) && record[option.field_from] && record[option.field_target.code]).map(option => {
        let dropdown = new MobileDropdown({items: [], className: 'kuc_dDown', label: option.field_target.label, selectedIndex: 0});
        dropdown = Object.assign(dropdown, {
          target_fieldCode: option.field_target.code,
          from_fieldCode: option.field_from,
          spaceId: option.putSpaceId,
          itemList: option.dynamicItems.reduce((listObj, dItem) => dItem.valueField_from ? Object.assign(listObj, { [dItem.valueField_from]: dItem.valuesField_target }) : listObj , {})
        });

        kintone.mobile.app.record.setFieldShown(option.field_target.code, false);
        kintone.mobile.app.record.getSpaceElement(option.putSpaceId).appendChild(dropdown);

        dropdown.addEventListener('change', function(event) {
          let record = kintone.mobile.app.record.get();
          record.record[this.target_fieldCode].value = event.detail.value;
          kintone.mobile.app.record.set(record);
        });

        setDropdownItems(event, dropdown);

        if (event.record[dropdown.target_fieldCode].value) {
          dropdown.value = event.record[dropdown.target_fieldCode].value;
        }

        return dropdown;
      });
    } else {
      dropdowns.forEach(function(dropdown) {
        if(dropdown.from_fieldCode === eTypeLastWord) {
          removeDropdownItems(event, dropdown);
          setDropdownItems(event, dropdown);
          event.record[dropdown.target_fieldCode].value = dropdown.value;
        }
      });
    }
    return event;
  })  

  function setDropdownItems(event, dropdown) {
    let ddItemList = dropdown.itemList;
    dropdown.items.push({label: '-----', value: ''});
    let targetValue = event.record[dropdown.from_fieldCode].value;    
    if(ddItemList.hasOwnProperty(targetValue)) {
      ddItemList[targetValue].forEach(function(prefecture) {
        dropdown.items.push({label: prefecture, value: prefecture});
      });      
    }
    dropdown.value = dropdown.items[0].value;
    // 既存の値が切替後の選択肢に存在すれば値をセットする
    if(event.record[dropdown.target_fieldCode].value && dropdown.items.findIndex(opt => opt.value === event.record[dropdown.target_fieldCode].value) >= 0)
      dropdown.value = event.record[dropdown.target_fieldCode].value;
  }

  function removeDropdownItems(event, dropdown) {        
    while (dropdown.items.length) {
      dropdown.items = [];
    }
  };

})(kintone.$PLUGIN_ID);
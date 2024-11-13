import React from "react";
import { useState, useEffect } from "react";

import { Container, Stack, Box, Grid, ThemeProvider, Paper, Typography, Alert } from "@mui/material";
import { FormControl, InputLabel , Select, MenuItem, OutlinedInput, Autocomplete, TextField} from "@mui/material";
import { Fab, IconButton } from "@mui/material";
import ThreeDRotation from '@mui/icons-material/ThreeDRotation';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { createTheme } from "@mui/material/styles";

import { styled } from "@mui/system";

const theme = createTheme({
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          position: 'absolute',
          top: '30VH',
          left: '50%',
          transform: 'translate(-50%, 0)',
          zIndex: '2'
        }
      }
    }
  }
});
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',  
  padding: theme.spacing(1),
}));

export default function Config({pluginId}) {  
  const initialValue = {
    putSpaceId: null,
    field_from: null,
    field_target: {label: '', code: null},
    dynamicItems: []
  };

  const initialDynamicItem = {
    valueField_from: '',
    valuesField_target: []
  }

  const [options, setOptions] = useState([initialValue]);
  const [fields, setFields] = useState([]);

  const [required, setRequired] = useState(false);

  const dropdownFields = fields.filter(field => field.type === 'DROP_DOWN');
  const spaces = fields.filter(field => field.type === 'SPACER');

  const hundleClickSave = () => {
    if(options.every(opt => opt.putSpaceId && opt.field_from && opt.field_target)) {
      kintone.plugin.app.setConfig({options: JSON.stringify(options)});
    } else {
      setRequired(true);
    }
  }

  const hundleClickCancel = () => {
    location.href = location.href.match(/.*\//)[0];
  };

  const hundleClickAdd = index => {
    const newOptions = [...options];
    newOptions.splice(index, 0, initialValue);
    setOptions(newOptions);
  }

  const hundleClickDel = index => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  }

  const hundleClickAddDynamicItem = (optionIndex, index) => {
    const newOptions = [...options];
    newOptions[optionIndex].dynamicItems.splice(index, 0, initialDynamicItem);
    setOptions(newOptions);
  }

  const hundleClickDelDynamicItem = (optionIndex, index) => {
    const newOptions = [...options];
    newOptions[optionIndex].dynamicItems.splice(index, 1);
    setOptions(newOptions);
  }

  const hundleChangeSpaceId = (value, index) => {
    const newOptions = [...options];
    newOptions[index].putSpaceId = value;
    setOptions(newOptions);
  }

  const hundleChangeField_From = (value, index) => {
    const newOptions = [...options];
    newOptions[index].field_from = value;
    if(value && newOptions[index].field_target.code && newOptions[index].dynamicItems.length === 0) {
      newOptions[index].dynamicItems = [initialDynamicItem];
    }
    setOptions(newOptions);
  }

  const hundleChangeField_Target = (valueOpt, index) => {
    const newOptions = [...options];
    newOptions[index].field_target.code = valueOpt ? valueOpt.code : null;
    newOptions[index].field_target.label = valueOpt ? valueOpt.label : null;
    if(newOptions[index].field_from && valueOpt && newOptions[index].dynamicItems.length === 0) {
      newOptions[index].dynamicItems = [initialDynamicItem];
    }
    setOptions(newOptions);
  }

  const hundleChangeDynamicItems = (values, index, dynamicIndex) => {
    const newOptions = [...options];
    newOptions[index].dynamicItems[dynamicIndex].valuesField_target = dropdownFields.findIndex(field => field.code === options[index].field_target.code) >= 0 ? values.filter((value) => Object.keys(dropdownFields[dropdownFields.findIndex(field => field.code === options[index].field_target.code)].options).map((key) => dropdownFields[dropdownFields.findIndex(field => field.code === options[index].field_target.code)].options[key]).findIndex(option => option.label === value) >= 0) : [];   
    setOptions(newOptions);
  }

  const hundleChangeValueField_From = (value, index, dynamicIndex) => {
    const newOptions = [...options];
    newOptions[index].dynamicItems[dynamicIndex].valueField_from = value;
    setOptions(newOptions);
  }

  const hundleChangeValueField_Target = (value, index, dynamicIndex) => {
    const newOptions = [...options];
    newOptions[index].dynamicItems[dynamicIndex].valuesField_target = value;
    setOptions(newOptions);
  }

  useEffect(() => {
    // フィールド取得
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {app: kintone.app.getId()}, resp => {      
      let newFields = Object.keys(resp.properties).reduce((fields, fieldCode) => {
        fields.push(resp.properties[fieldCode]);
        if(resp.properties[fieldCode].type === 'SUBTABLE') {
          fields = fields.concat(Object.keys(resp.properties[fieldCode].fields).map(key => resp.properties[fieldCode].fields[key]));
        }
        return fields;
      }, []);
      // スペース取得
      KintoneConfigHelper.getFields('SPACER').then(resp => {
        newFields = newFields.concat(resp.map(spacer => ({type: spacer.type, label: spacer.elementId, label: spacer.elementId})));
        setFields(newFields);
      }).catch(err => {
        console.log(err);        
      });            
    }, err => {
      console.log(err);
    });

    // 設定情報取得
    if(pluginId) {
      const configObj = kintone.plugin.app.getConfig(pluginId);
      if(configObj.options) {
        let newOptions = JSON.parse(configObj.options);
        newOptions = newOptions.map(newOption => {
          let newOpt = Object.assign({...initialValue}, newOption);          
          return newOpt;
        });
        setOptions(newOptions);
      }
    }
  }, []);
    
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h1" fontSize={20} id="plugin-title">動的切替ドロップダウン-プラグイン</Typography>
        <Stack spacing={1}>          
          {          
            options.map((opt, optIndex) => {
              return (
                <Item className="kintoneplugin-row" key={optIndex} fontSize={14}>
                  <Grid container spacing={2}>
                    <Grid item className="insert-space" xs={4}>
                      <Typography variant="h2" fontSize={15} className="input-title">動的ドロップダウンの表示先スペース<span className="kintoneplugin-require">*</span></Typography>
                      <Autocomplete
                        options={spaces.filter(space => options.findIndex(option => option.putSpaceId === space.label) < 0).map(({label}) => label)}
                        noOptionsText="見つかりません"                        
                        renderInput={(params) => <TextField {...params} label="Space" />}
                        value={opt.putSpaceId}
                        onChange={(event, value) => { hundleChangeSpaceId(value, optIndex) }}
                      />
                    </Grid>
                    <Grid item className="select-fields_from" xs={4}>
                      <Typography variant="h2" fontSize={15} className="input-title">切替元フィールド<span className="kintoneplugin-require">*</span></Typography>
                      <Autocomplete
                        options={dropdownFields.map(({label, code}) => ({label, code}))}
                        getOptionDisabled={option => options.findIndex((findOpt, findIndex) => optIndex !== findIndex && findOpt.field_target.code === option.code) >= 0}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.code}>
                            {option.label}
                          </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label="Field" />}
                        noOptionsText="見つかりません"
                        onChange={(event, value) => { hundleChangeField_From(value ? value.code : null, optIndex) }}
                        value={
                          dropdownFields.findIndex(field => field.code === opt.field_from) >= 0 ?
                            {label: dropdownFields[dropdownFields.findIndex(field => field.code === opt.field_from)].label, code: dropdownFields[dropdownFields.findIndex(field => field.code === opt.field_from)].code} : null
                        }                        
                      />             
                    </Grid>
                    <Grid item className="select-fields_target" xs={4}>
                      <Typography variant="h2" fontSize={15} className="input-title">切替対象フィールド<span className="kintoneplugin-require">*</span></Typography>
                      <Autocomplete
                        options={dropdownFields.map(({label, code}) => ({label, code}))}
                        getOptionDisabled={option => options.findIndex(findOpt => findOpt.field_from === option.code) >= 0}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.code}>
                            {option.label}
                          </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label="Field" />}
                        noOptionsText="見つかりません"
                        onChange={(event, valueOpt) => { hundleChangeField_Target(valueOpt ? valueOpt : null, optIndex) }}
                        value={
                          dropdownFields.findIndex(field => field.code === opt.field_target.code) >= 0 ?
                            opt.field_target : null
                        }                        
                      />
                    </Grid>
                    {
                      dropdownFields.findIndex(field => field.code === opt.field_from) >= 0 && dropdownFields.findIndex(field => field.code === opt.field_target.code) >= 0 && opt.dynamicItems.map((dynamicItem, dynamicIndex) => {
                        return (
                          <Grid item xs={12} key={dynamicIndex}>
                            <Grid container>
                              <Grid item xs={4}>
                                <Typography variant="h2" fontSize={15} className="input-title">切替元フィールドの値</Typography>
                                <Autocomplete
                                  options={Object.keys(dropdownFields[dropdownFields.findIndex(field => field.code === opt.field_from)].options)}
                                  getOptionDisabled={option => opt.dynamicItems.findIndex((dItem, findIndex) => findIndex !== dynamicIndex && dItem.valueField_from === option) >= 0}
                                  renderOption={(props, option) => (
                                    <Box component="li" {...props} key={option}>
                                      {option}
                                    </Box>
                                  )}
                                  renderInput={(params) => <TextField {...params} label="Field" />}
                                  noOptionsText="見つかりません"
                                  onChange={(event, value) => { hundleChangeValueField_From(value ? value : null, optIndex, dynamicIndex) }}
                                  value={ Object.keys(dropdownFields[dropdownFields.findIndex(field => field.code === opt.field_from)].options).findIndex(label => label === dynamicItem.valueField_from) >= 0 ? dynamicItem.valueField_from : null }
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h2" fontSize={15} className="input-title">切替対象フィールドの値</Typography>
                                <FormControl fullWidth>
                                  <InputLabel id={`demo-multiple-name_${dynamicIndex}`} >{"値"}</InputLabel>
                                  <Select
                                    label="値"
                                    labelId={`demo-multiple-name_${dynamicIndex}`}
                                    multiple
                                    value={dynamicItem.valuesField_target}
                                    onChange={(event) => { hundleChangeDynamicItems(event.target.value, optIndex, dynamicIndex) }}                                         
                                  >                      
                                    {
                                      dropdownFields.findIndex(field => field.code === opt.field_target.code) >= 0 && Object.keys(dropdownFields[dropdownFields.findIndex(field => field.code === opt.field_target.code)].options).map((label) => (
                                        <MenuItem
                                          key={label}
                                          value={label}
                                          // style={getStyles(name, personName, theme)}
                                        >
                                          {label}
                                        </MenuItem>
                                      ))
                                    }
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={2} display="flex" alignItems="center">
                                    <IconButton aria-label="add-selectOptions-of-dynamicItem" color="primary" fontSize="large" onClick={() => { hundleClickAddDynamicItem(optIndex, dynamicIndex+1) }}><AddIcon sx={{ fontSize: 24 }} /></IconButton>
                                    {opt.dynamicItems.length > 1 && <IconButton aria-label="delete-selectOptions-of-dynamicItem" color="error" fontSize="large" onClick={() => { hundleClickDelDynamicItem(optIndex, dynamicIndex) }}><RemoveIcon sx={{ fontSize: 24 }} /></IconButton>}
                              </Grid>
                            </Grid>
                          </Grid>
                        )
                      })
                    }                    
                  </Grid>
                  <IconButton aria-label="add-options" color="primary" size="large" onClick={() => { hundleClickAdd(optIndex+1) }}><AddCircleOutlineIcon /></IconButton>
                  {options.length > 1 && <IconButton aria-label="delete-options" color="error" size="large" onClick={() => { hundleClickDel(optIndex) }}><RemoveCircleOutlineIcon /></IconButton>}
                </Item>
              )
            })
          }
        </Stack>
        <Fab className="save-cancel" color="primary" aria-label="save" variant="extended" sx={{width: 100}} onClick={() => { hundleClickSave() }}>保存する</Fab>
        <Fab className="save-cancel" color="error" aria-label="cancel" variant="extended" sx={{width: 100}} onClick={() => { hundleClickCancel() }}>キャンセル</Fab>
      </Container>
      {required && <Alert fullWidth severity="error">必須項目が入力されていません。</Alert>}
    </ThemeProvider>
  );
}
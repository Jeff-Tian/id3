/*
 * goeditor-setup.js
 * Called before init() events in every goeditor app
 * Initializes the diagrams, palettes, GoCloudStorage, and the Inspector
 * You may need to edit or override things in your own code
 * DO NOT edit this file -- make app-specific overrides or custom changes in your own code
 * DO NOT delete or rename this file
 */

import * as go from '../../../release/go';
import { DiagramFile } from '../../storage/GoCloudStorage';
import { GoCloudStorage } from '../../storage/GoCloudStorage';
import { GoCloudStorageManager } from '../../storage/GoCloudStorageManager';
import { GoDropBox } from '../../storage/GoDropBox';
import { GoGoogleDrive } from '../../storage/GoGoogleDrive';
import { GoLocalStorage } from '../../storage/GoLocalStorage';
import { GoOneDrive } from '../../storage/GoOneDrive';
import { Inspector } from './DataInspector';

export class EditorHelper {

  public isAutoSavingCheckbox: HTMLInputElement;
  public isAutoSavingP: HTMLParagraphElement;

  public diagrams: Array<go.Diagram>;
  public overviews: Array<go.Overview>;
  public palettes: Array<go.Palette>;
  public defaultModel: string | undefined;

  public storages: Array<any>;
  public storageManager: GoCloudStorageManager;
  public gls: GoLocalStorage;
  public ggd: GoGoogleDrive;
  public god: GoOneDrive;
  public gdb: GoDropBox;

  public JQUERY: any;

  public inspector: Inspector;

  constructor(diagramsCount: number, palettesCount: number, pathToStorage: string, diagramsType: any, JQUERY: any) {
    // GoCloudStorage helpers
    this.isAutoSavingCheckbox = document.getElementById('isAutoSavingCheckbox') as HTMLInputElement;
    this.isAutoSavingP = document.getElementById('isAutoSavingP') as HTMLParagraphElement;

    if (diagramsType === null || !diagramsType) {
      diagramsType = go.Diagram;
    }

    JQUERY = JQUERY;

    // build diagrams
    const $ = go.GraphObject.make;  // for conciseness in defining templates
    this.diagrams = [];
    this.overviews = [];
    const editorHelper = this;
    for (let i = 0; i < diagramsCount; i++) {
      const diagram = new diagramsType('ge-diagram-' + i);  // create a Diagram for the DIV HTML element
      diagram.undoManager.isEnabled = true;
      // When diagram is modified, change title to include a *
      diagram.addChangedListener(function(e: go.InputEvent) {
        // maybe update the file header
        const currentFile = document.getElementById('ge-filename') as HTMLElement;
        if (editorHelper.isAutoSavingCheckbox.checked && editorHelper.storageManager.currentStorage.currentDiagramFile.name != null) return;
        if (currentFile) {
          const idx: number = (currentFile.textContent as string).indexOf('*');
          if (e.diagram.isModified) {
            if (idx < 0) currentFile.textContent = currentFile.textContent + '*';
          } else {
            if (idx >= 0) currentFile.textContent = (currentFile.textContent as string).slice(0, idx);
          }
        }
      });

      this.diagrams[i] = diagram;

      // make an overview for each diagram
      const overview = $(go.Overview, 'ge-overview-' + i, { observed: diagram });
      this.overviews[i] = overview;

    }

    // if there are no diagrams, there will be no overviews, so do not list that option in View menu
    if (diagramsCount < 1) {
      const viewOverviewsOption = document.getElementById('ge-viewoption-overviews') as Node;
      (viewOverviewsOption.parentNode as Node).removeChild(viewOverviewsOption);
    }

    // build palette(s)
    this.palettes = [];
    for (let i = 0; i < palettesCount; i++) {
      const palette = $(go.Palette, 'ge-palette-' + i);
      this.palettes[i] = palette;
    }

    // Go Cloud Storage stuff
    this.defaultModel = undefined; // change this if you want -- so GoCloudStorage documentation

    const iconsDir = pathToStorage + '/goCloudStorageIcons/';
    this.gls = new GoLocalStorage(this.diagrams, this.defaultModel, iconsDir);
    this.god = new GoOneDrive(this.diagrams, 'f9b171a6-a12e-48c1-b86c-814ed40fcdd1', this.defaultModel, iconsDir);
    this.ggd = new GoGoogleDrive(this.diagrams, '16225373139-n24vtg7konuetna3ofbmfcaj2infhgmg.apps.googleusercontent.com',
      'AIzaSyDBj43lBLpYMMVKw4aN_pvuRg7_XMVGf18', this.defaultModel, iconsDir);
    this.gdb = new GoDropBox(this.diagrams, '3sm2ko6q7u1gbix', this.defaultModel, iconsDir);
    this.storages = [this.gls, this.god, this.ggd, this.gdb];
    this.storageManager = new GoCloudStorageManager(this.storages, iconsDir);

    const span = document.getElementById('currentStorageSpan') as HTMLSpanElement;
    span.innerHTML = '';
    const imageSrc = this.storageManager.getStorageIconPath(this.storageManager.currentStorage.className);
    const img = document.createElement('img');
    img.src = imageSrc as string;
    img.style.width = '20px'; img.style.height = '20px'; img.style.cssFloat = 'left';
    span.appendChild(img);

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.accept = '.csv';

    this.storageManager.currentStorage.isAutoSaving = this.isAutoSavingCheckbox.checked;

    this.isAutoSavingCheckbox.addEventListener('change', function() {
      editorHelper.storageManager.storages.iterator.each(function(storage: GoCloudStorage) {
        storage.isAutoSaving = editorHelper.isAutoSavingCheckbox.checked;
      });
      // update the title to reflect the save
      const currentFile = document.getElementById('ge-filename') as HTMLElement;
      const currentFileTitle = currentFile.innerText;
      if (currentFileTitle[currentFileTitle.length - 1] === '*' && editorHelper.storageManager.currentStorage.currentDiagramFile.name != null) {
        currentFile.innerText = currentFileTitle.slice(0, -1);
        editorHelper.storageManager.currentStorage.save();
      }
    });

    // enable hotkeys
    document.body.addEventListener('keydown', function(e) {
      const keynum = e.which;
      if (e.ctrlKey) {
        e.preventDefault();
        switch (keynum) {
          case 83: editorHelper.handlePromise('Save'); break; // ctrl + s
          case 79: editorHelper.handlePromise('Load'); break; // ctrl + o
          case 68: editorHelper.handlePromise('New'); break; // ctrl + d
          case 82: editorHelper.handlePromise('Delete'); break; // ctrl + r
          case 80: editorHelper.geHideShowWindow('ge-palettes-window'); break;
          case 69: editorHelper.geHideShowWindow('ge-overviews-window'); break; // ctrl + e
          case 73: editorHelper.geHideShowWindow('ge-inspector-window'); break; // ctrl + i
        }
      }
    });

    this.updateAutoSaveVisibility();

    // Format the inspector for your specific needs. You may need to edit the DataInspector class
    this.inspector = new Inspector('ge-inspector', this.diagrams[0],
      {
        includesOwnProperties: true
      }
    );

    function makeGCSWindowsDraggable() {
      // special -- make sure all gcs windows are draggable via jQuery UI classes
      // do so by wrapping the filepicker divs in a draggable ge-window div -- with a handle
      let gcsWindows = document.getElementsByClassName('goCustomFilepicker') as any;
      gcsWindows = [].slice.call(gcsWindows);
      const gcsManagerMenu = document.getElementById('goCloudStorageManagerMenu');
      gcsWindows.push(gcsManagerMenu);
      for (let i = 0; i < gcsWindows.length; i++) {
        const gcsWindow = gcsWindows[i];

        // possibly delete pre-existing window
        const id = 'ge-' + gcsWindow.id + '-window';
        let windowParent = document.getElementById(id);
        if (windowParent !== null && windowParent !== undefined) {
          (windowParent.parentNode as Node).removeChild(windowParent);
        }

        // construct window wrapper for gcs menu
        windowParent = document.createElement('div');
        windowParent.id = id;
        windowParent.classList.add('ge-draggable');
        windowParent.classList.add('ui-draggable');
        windowParent.classList.add('ge-menu');
        windowParent.style.visibility = 'hidden';


        const handle = document.createElement('div');
        handle.id = id + '-handle';
        handle.classList.add('ge-handle');
        handle.classList.add('ui-draggable-handle');
        handle.innerText = 'Storage';
        const button = document.createElement('button');
        button.id = id + '-close';
        button.innerText = 'X';
        button.classList.add('ge-clickable');
        button.classList.add('ge-window-button');
        button.onclick = function() {
          const ci = button.id.indexOf('-close');
          const wpid = button.id.substring(0, ci);
          const windowParentAgain = document.getElementById(wpid) as HTMLElement;
          editorHelper.geHideShowWindow(windowParentAgain.id);
          for (let j = 0; j < windowParentAgain.children.length; j++) {
            const child = windowParentAgain.children[j];
            if (!child.classList.contains('ge-handle')) {
              (child as HTMLElement).style.visibility = windowParentAgain.style.visibility;
            }
          }
        };
        handle.appendChild(button);

        windowParent.appendChild(handle);

        windowParent.appendChild(gcsWindow);
        document.body.appendChild(windowParent);

        const observer = new MutationObserver((mutations) => {
          const newVis = (mutations[0].target as HTMLElement).style.visibility;
          const pn = mutations[0].target.parentNode as HTMLElement;
          pn.style.visibility = newVis;
        });
        observer.observe(gcsWindow, {
          attributes: true,
          attributeFilter: ['style']
        });

      }
    }


    //   JQUERY(function() {
    //     let draggables = document.getElementsByClassName("ge-draggable");
    //     for (let i = 0; i < draggables.length; i++) {
    //       let draggable = draggables[i];
    //       let id = "#" + draggable.id; let hid = id + "-handle";
    //       JQUERY(id).draggable({ handle: hid, stack: ".ge-draggable", containment: "window", scroll: false });
    //     }
    //   });

    // }
    // makeGCSWindowsDraggable();

  }

  // choose new storage service; then, update the current storage span with the correct picture of the current storage service being used
  public updateCurrentStorageSpan() {
    const editorHelper = this;
    editorHelper.storageManager.selectStorageService().then(function(storage: GoCloudStorage) {
      const span = document.getElementById('currentStorageSpan') as HTMLSpanElement;
      span.innerHTML = '';
      const imageSrc = editorHelper.storageManager.getStorageIconPath((storage as GoCloudStorage).className);
      const img = document.createElement('img');
      img.src = imageSrc as string;
      img.style.width = '20px'; img.style.height = '20px'; img.style.cssFloat = 'left';
      span.appendChild(img);
      (storage as GoCloudStorage).isAutoSaving = editorHelper.isAutoSavingCheckbox.checked;
      editorHelper.updateAutoSaveVisibility();
    });
  }

  // update the title on page to reflect newly loaded diagram title
  public updateTitle() {
    const editorHelper = this;
    const currentFile = document.getElementById('ge-filename');
    if (editorHelper.storageManager.currentStorage.currentDiagramFile.path !== null) {
      const storage = editorHelper.storageManager.currentStorage;
      if (storage.currentDiagramFile.path) (currentFile as HTMLElement).innerHTML = storage.currentDiagramFile.path;
      else (currentFile as HTMLElement).innerHTML = storage.currentDiagramFile.name;
    } else {
      (currentFile as HTMLElement).innerHTML = 'Untitled';
      // (storageTag as HTMLElement).innerHTML = 'Unsaved'; /// ??? what is storageTag???
    }
  }

  // can only use the auto save checkbox if the file is already saved to the current storage service
  public updateAutoSaveVisibility() {
    const cdf = this.storageManager.currentStorage.currentDiagramFile;
    this.isAutoSavingP.style.visibility = (cdf.name === null) ? 'hidden' : 'visible';
  }

  /**
   * Promise handler for core functions
   * @param {String} action Accepted values: Load, Delete, New, Save
   */
  public handlePromise(action: string) {

    const editorHelper = this;

    // tslint:disable-next-line:no-shadowed-variable
    function handleFileData(action: string, fileData: DiagramFile | any) {
      let words: Array<string> = [];
      switch (action) {
        case 'Load': words = ['Loaded', 'from']; break;
        case 'Delete': words = ['Deleted', 'from']; break;
        case 'New': words = ['Created', 'at']; break;
        case 'Save': words = ['Saved', 'to']; break;
        case 'SaveAs': words = ['Saved', 'to']; break;
      }
      const storageServiceName = editorHelper.storageManager.currentStorage.serviceName;
      if (fileData.id && fileData.name && fileData.path) {
        editorHelper.storageManager.showMessage(words[0] + ' ' + fileData.name + ' (file ID ' + fileData.id + ') ' +
          words[1] + ' path ' + fileData.path + ' in ' + storageServiceName, 1.5);
        // tslint:disable-next-line:no-console
      } else console.error(fileData); // may have an explanation for why fileData isn't complete
      editorHelper.updateTitle();
      editorHelper.updateAutoSaveVisibility();
    }

    switch (action) {
      case 'Load': editorHelper.storageManager.load().then(function(fileData: any) {
        handleFileData(action, fileData);
      }, (e: any) => {
        console.log(e);
      }); break;
      case 'Delete': editorHelper.storageManager.remove().then(function(fileData: any) {
        handleFileData(action, fileData);
      }); break;
      case 'New':
        let saveBefore = false;
        const currentFile = document.getElementById('ge-filename');
        // only prompt to save current changes iff there is some modified state
        const currentFileTitle = (currentFile as HTMLElement).innerText;
        if (currentFileTitle.slice(-1) === '*') {
          saveBefore = true;
        }
        editorHelper.storageManager.create(saveBefore).then(function(fileData: any) {
          handleFileData(action, fileData);
        });
        break;
      case 'SaveAs': editorHelper.storageManager.save().then(function(fileData: any) {
        handleFileData(action, fileData);
      }); break;
      case 'Save': editorHelper.storageManager.save(false).then(function(fileData: any) {
        handleFileData(action, fileData);
      }); break;
    }
  }

  // Small, generic helper functions
  public refreshDraggableWindows() {
    this.JQUERY('.gt-menu').draggable({ handle: '.gt-handle', stack: '.gt-menu', containment: 'window', scroll: false });
  }


  // makes images of each diagram
  public makeDiagramImage() {
    const editorHelper = this;
    for (let i = 0; i < editorHelper.diagrams.length; i++) {
      const diagram = editorHelper.diagrams[i];
      const imgdata = diagram.makeImageData({ maxSize: new go.Size(Infinity, Infinity), scale: 2, padding: 10, background: (diagram.div as HTMLDivElement).style.background });
      const a = document.createElement('a') as HTMLAnchorElement;
      let filename = (document.getElementById('ge-filename') as HTMLElement).innerText;
      filename.split('.');
      filename = filename[0];
      a.download = filename;
      if (imgdata !== null) {
        a.href = imgdata as string;
      }
      a.target = '_blank';
      a.click();
    }
  }

  // make SVG files of each diagram
  public makeDiagramSvg() {
    const editorHelper = this;
    for (let i = 0; i < editorHelper.diagrams.length; i++) {
      const diagram = editorHelper.diagrams[i];
      const svgDataEl = diagram.makeSvg();
      const s = new XMLSerializer();
      const svgData = s.serializeToString(svgDataEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      let filename = (document.getElementById('ge-filename') as HTMLElement).innerText;
      const filenameArr: Array<string> = filename.split('.');
      filename = filenameArr[0];
      downloadLink.download = filename + '.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  public geHideShowWindow(id: string, doShow?: boolean) {
    const geWindow = document.getElementById(id) as HTMLElement;
    let vis: string | null = null;
    if (doShow === undefined) vis = geWindow.style.visibility === 'visible' ? 'hidden' : 'visible';
    else if (doShow) vis = 'visible';
    else vis = 'hidden';

    let pn: ParentNode | null = null;
    if (((geWindow as HTMLElement).parentNode as HTMLElement).classList.contains('ge-menu')) {
      pn = geWindow.parentNode;
    }
    if (pn) {
      (pn as HTMLElement).style.visibility = vis;
    }
    geWindow.style.visibility = vis;
  }

}






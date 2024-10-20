"use strict";

import "@gouvfr/dsfr/dist/component/tab/tab.module.js";

import { FileTable } from "../../../../assets/js/components/file-table.js";
import { FileUploadForm } from "../../../../assets/js/components/file-upload-form.js";
import { initRawData } from "../raw-data/index.js";
import { initProcessedData } from "../processed-data/index.js";
import VirtualOfficeButton from "../components/virtual-office-button.js";
import VirtualOfficeDelteButton from "../components/virtual-office-delete-button.js";
import VMSizeSelect from "../components/vm-size-select.js";

FileTable.init();
FileUploadForm.init();
VirtualOfficeButton.init();
VirtualOfficeDelteButton.init();
VMSizeSelect.init();

initRawData();
initProcessedData();

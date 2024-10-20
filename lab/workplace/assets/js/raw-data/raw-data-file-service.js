"use strict";

import { FileService } from "../../../../assets/js/file-service.js";

export class RawDataFileService extends FileService {
  constructor(projectSlug, runName) {
    super(
      `/data/${projectSlug}/runs/${runName}/raw_data`,
      `/data/runs/shared_access_signature`
    );
  }
}

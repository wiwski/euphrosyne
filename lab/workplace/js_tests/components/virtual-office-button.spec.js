import { jest } from "@jest/globals";
import "../../../js_tests/_jsdom_mocks/gettext";
import euphrosyneToolsService from "../../assets/js/euphrosyne-tools-service";
import VirtualOfficeButton from "../../assets/js/components/virtual-office-button";

import utils from "../../../assets/js/utils";

describe("Test VirtualOfficeButton", () => {
  let voButton, fetchVMMock, fetchDeploymentMock;
  VirtualOfficeButton.init();

  beforeEach(() => {
    fetchVMMock = jest.spyOn(euphrosyneToolsService, "fetchVMConnectionLink");
    fetchDeploymentMock = jest.spyOn(
      euphrosyneToolsService,
      "fetchDeploymentStatus"
    );
    jest.spyOn(utils, "displayMessage");

    voButton = new VirtualOfficeButton();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Button init", () => {
    describe("When receiving connection URL directly", () => {
      beforeEach(() => {
        voButton.setAttribute("project-slug", "projet-tango");
        fetchVMMock.mockResolvedValueOnce("url");
      });
      it("creates the button properly", async () => {
        await voButton.initButton();
        expect(voButton.projectSlug).toBe("projet-tango");
        expect(voButton.connectionUrl).toBe("url");
        expect(voButton.disabled).toBeFalsy();
      });
    });

    describe("When receiving deployment status", () => {
      beforeEach(() => {
        fetchVMMock.mockResolvedValue(false);
      });

      it("wait for deploy if it has not failed", async () => {
        jest
          .spyOn(VirtualOfficeButton.prototype, "waitForDeploymentComplete")
          .mockImplementation(() => Promise.resolve());
        fetchDeploymentMock.mockResolvedValueOnce("Running");
        await voButton.initButton();

        expect(voButton.waitForDeploymentComplete).toHaveBeenCalled();

        VirtualOfficeButton.prototype.waitForDeploymentComplete.mockRestore();
      });
      it("calls failed deployment callback otherwise", async () => {
        jest.spyOn(VirtualOfficeButton.prototype, "onFailedDeployment");
        fetchDeploymentMock.mockResolvedValueOnce("Failed");
        await voButton.initButton();

        expect(voButton.onFailedDeployment).toHaveBeenCalled();

        VirtualOfficeButton.prototype.onFailedDeployment.mockRestore();
      });
    });
  });

  describe("checking for deployment progress", () => {
    it("fetches deployment status again when deployment in progress", async () => {
      voButton.deploymentStatus = "Running";
      fetchDeploymentMock.mockResolvedValueOnce("Success");
      await voButton.checkDeploymentProgress();

      expect(voButton.deploymentStatus).toBe("Success");
      expect(fetchDeploymentMock).toHaveBeenCalledTimes(1);
    });

    it("fetches connection URL when deployment has succeeded", async () => {
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");
      voButton.deploymentStatus = "Succeeded";
      fetchVMMock.mockResolvedValueOnce("url");
      await voButton.checkDeploymentProgress();

      expect(voButton.connectionUrl).toBe("url");
      expect(voButton.innerText).toBe("Access virtual office");
      expect(voButton.disabled).toBeFalsy();
      expect(voButton.checkDeploymentIntervalId).toBeNull();
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it("handles failed deployment correctly", async () => {
      jest
        .spyOn(VirtualOfficeButton.prototype, "onFailedDeployment")
        .mockImplementation(() => {});
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");
      voButton.deploymentStatus = "Failed";
      fetchDeploymentMock.mockResolvedValueOnce("Failed");
      await voButton.checkDeploymentProgress();

      expect(voButton.onFailedDeployment).toHaveBeenCalledTimes(1);
      expect(voButton.checkDeploymentIntervalId).toBeNull();
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

      VirtualOfficeButton.prototype.onFailedDeployment.mockRestore();
    });
  });

  describe("clicking on button", () => {
    it("opens a new window on click when connection url is set", async () => {
      voButton.connectionUrl = "url";
      const openSpy = jest.spyOn(window, "open");
      voButton.click();
      expect(openSpy).toHaveBeenCalledWith("url", "_blank");
    });

    it("deploys otherwise [success]", async () => {
      const deployMock = jest
        .spyOn(euphrosyneToolsService, "deployVM")
        .mockImplementationOnce(() => Promise.resolve());
      const waitDeployMock = jest
        .spyOn(VirtualOfficeButton.prototype, "waitForDeploymentComplete")
        .mockImplementationOnce(() => {});
      voButton.setAttribute("project-slug", "projet-tango");
      await voButton.onButtonClick();

      expect(deployMock).toHaveBeenCalledWith("projet-tango");
      expect(waitDeployMock).toHaveBeenCalledTimes(1);
      expect(voButton.disabled).toBe(true);

      VirtualOfficeButton.prototype.waitForDeploymentComplete.mockRestore();
    });

    it("deploys otherwise [failure]", async () => {
      const deployMock = jest
        .spyOn(euphrosyneToolsService, "deployVM")
        .mockImplementationOnce(() => Promise.reject());
      voButton.setAttribute("project-slug", "projet-tango");

      let hadError = false;
      try {
        await voButton.onButtonClick();
      } catch (_) {
        hadError = true;
      }

      expect(hadError).toBe(true);
      expect(voButton.disabled).toBe(false);

      deployMock.mockRestore();
    });
  });

  describe("on deployment failure", () => {
    it("reset button and display an error message", () => {
      voButton.onFailedDeployment();

      expect(voButton.innerText).toBe("Access virtual office");
      expect(utils.displayMessage).toHaveBeenNthCalledWith(
        1,
        "We could not create the virtual office. Please contact an administrator.",
        "error"
      );
    });
  });

  describe("waiting for deployment complete", () => {
    it("reset button and display an error message", () => {
      jest
        .spyOn(VirtualOfficeButton.prototype, "checkDeploymentProgress")
        .mockImplementation(() => Promise.resolve());
      jest.useFakeTimers();
      voButton.waitForDeploymentComplete();

      expect(voButton.innerText).toBe("Creating virtual office...");
      expect(voButton.checkDeploymentProgress).toHaveBeenNthCalledWith(1);
      expect(voButton.checkDeploymentIntervalId).toBeTruthy();

      jest.advanceTimersByTime(8000);
      expect(voButton.checkDeploymentProgress).toHaveBeenNthCalledWith(2);
      jest.useRealTimers();
    });
  });

  describe("when receiving delete event", () => {
    it("reset the button", () => {
      voButton.disabled = true;
      voButton.innerText = "Another text";
      voButton.connectionUrl = "url";

      window.dispatchEvent(new CustomEvent("vm-deleted"));

      expect(voButton.disabled).toBe(false);
      expect(voButton.innerText).toBe("Create virtual office");
      expect(voButton.connectionUrl).toBeNull();
    });
  });
});

import { CasparCG, CgAddParameters, CgStopParameters } from 'casparcg-connection';
import ConstantsService from './constants.service';

/* Note: Temp service to test the integration */
export default class CasparCGService {
  private casparCg: CasparCG;

  constructor(
    private host: string = ConstantsService.CASPARCG_HOST,
    private port: number = ConstantsService.CASPARCG_PORT,
  ) {
    this.casparCg = new CasparCG({ host: this.host, port: this.port });
  }

  connect() {
    try {
      this.casparCg.connect();
      console.log('Connected to CasparCG');
    } catch (error) {
      console.error('Error connecting to CasparCG:', error);
      throw error;
    }
  }

  async sendAddCommand(data: CgAddParameters) {
    try {
      const response = await this.casparCg.cgAdd({ ...data, data: JSON.stringify(data.data) });
      return response;
    } catch (error) {
      console.error('Error sending ADD command:', error);
      throw error;
    }
  }

  async sendUpdateCommand(data: CgAddParameters) {
    try {
      const response = await this.casparCg.cgUpdate({ ...data, data: JSON.stringify(data.data) });
      return response;
    } catch (error) {
      console.error('Error sending ADD command:', error);
      throw error;
    }
  }

  async sendStopCommand(data: CgStopParameters) {
    try {
      const response = await this.casparCg.cgStop(data);
      return response;
    } catch (error) {
      console.error('Error sending STOP command:', error);
      throw error;
    }
  }

  async sendTimeoutCommand(data: CgStopParameters, timeout: number): Promise<void> {
    setTimeout(async () => {
      await this.sendStopCommand(data);
    }, timeout);
  }

  close(): void {
    this.casparCg.disconnect();
    console.log('Disconnected from CasparCG');
  }
}

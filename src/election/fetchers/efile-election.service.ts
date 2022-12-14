import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface EfileElectionResults {
  election_date: string;
  election_id: string;
  election_type: string;
  internal: boolean;
}

@Injectable()
export class EfileElectionService {
  constructor(private httpService: HttpService) {}

  private defaultUrlPrefix = `https://efile.sandiego.gov/api/v1/public`;
  private urlPath = `campaign-search/election/list`;

  async runDownloadElections(urlPrefix: string = this.defaultUrlPrefix) {
    const url = `${urlPrefix}/${this.urlPath}`;
    try {
      return await this.downloadElections(url);
    } catch {
      console.log('Error downloading eFile Elections');
    }
  }

  private async downloadElections(url: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<AxiosResponse<EfileElectionResults[]>>(url),
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

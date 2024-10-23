import { parseEther } from 'ethers';
import { Serving__factory } from './serving';
export class ServingContract {
    serving;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = Serving__factory.connect(contractAddress, signer);
        this._userAddress = userAddress;
    }
    lockTime() {
        return this.serving.lockTime();
    }
    async listService() {
        try {
            const services = await this.serving.getAllServices();
            return services;
        }
        catch (error) {
            console.error('Error list services:', error);
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts();
            return accounts;
        }
        catch (error) {
            console.error('Error list accounts:', error);
            throw error;
        }
    }
    async getAccount(user, provider) {
        try {
            const account = await this.serving.getAccount(user, provider);
            return account;
        }
        catch (error) {
            console.error('Error get account:', error);
            throw error;
        }
    }
    async addOrUpdateService(name, serviceType, url, model, inputPrice, outputPrice) {
        try {
            const tx = await this.serving.addOrUpdateService(name, serviceType, url, model, inputPrice, outputPrice);
            const receipt = await tx.wait();
            if (receipt?.status === 1) {
                console.log('Transaction was successful!');
            }
            else {
                const error = new Error('Transaction failed');
                console.error(error.message);
                throw error;
            }
        }
        catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }
    async addAccount(providerAddress, signer, balance) {
        try {
            const tx = await this.serving.addAccount(providerAddress, signer, {
                value: BigInt(balance),
            });
            const receipt = await tx.wait();
            if (receipt?.status === 1) {
                console.log('Transaction was successful!');
            }
            else {
                const error = new Error('Transaction failed');
                console.error(error.message);
                throw error;
            }
        }
        catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }
    async depositFund(providerAddress, balance) {
        try {
            const tx = await this.serving.depositFund(providerAddress, {
                value: parseEther(balance),
            });
            const receipt = await tx.wait();
            if (receipt?.status === 1) {
                console.log('Transaction was successful!');
            }
            else {
                const error = new Error('Transaction failed');
                console.error(error.message);
                throw error;
            }
        }
        catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }
    async getService(providerAddress, svcName) {
        try {
            return this.serving.getService(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    }
    getUserAddress() {
        return this._userAddress;
    }
}
//# sourceMappingURL=contract.js.map
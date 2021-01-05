namespace lego {
    const MAVLINK_STX = 0xfe
    const MAVLINK_MSG_ID_CTRL_SERVO = 0
    const MAVLINK_MSG_ID_CTRL_MOTOR = 1
    //support v1.0 protocol 
    export class Mavlink {
        seq:number

        constructor() {
            this.seq = 0;
        }

        //X25 checksum 
        private calculateChecksum(buffer:Buffer,crcIN?:number):number {
            let checksum = crcIN || 0xffff;
            for (let i = 0; i < buffer.length; i++) {
                let tmp = buffer[i] ^ (checksum & 0xff);
                tmp = (tmp ^ (tmp<<4)) & 0xFF;
                checksum = (checksum>>8) ^ (tmp<<8) ^ (tmp<<3) ^ (tmp>>4);
                checksum = checksum & 0xFFFF;
            }
            return checksum;
        }

        public mavlinkPackCtrlServo(angle:number,srcSystem?:number, srcComponent?:number) : Buffer{
            let stx = pins.createBuffer(1)
            stx[0] = MAVLINK_STX;
            let buffer2 = pins.createBuffer(7)
            buffer2[0] = 0x02;
            buffer2[1] = this.seq;
            buffer2[2] = ( typeof srcSystem === 'undefined' ) ? 1 : srcSystem;
            buffer2[3] = ( typeof srcComponent === 'undefined' ) ? 1 : srcComponent;
            buffer2[4] = MAVLINK_MSG_ID_CTRL_SERVO;//msg id
            buffer2[5] = angle&0xff;//
            buffer2[6] = angle>>8;//
            let checksum = this.calculateChecksum(buffer2);
            let crc_extrabuf = pins.createBuffer(1)
            crc_extrabuf[0] = 166;
            checksum = this.calculateChecksum(crc_extrabuf,checksum);
            let crc_buf = pins.createBuffer(2)
        
            crc_buf[0] = checksum&0xff;
            crc_buf[1] = checksum>>8;
            this.seq = (this.seq + 1) % 256;
        
            return Buffer.concat([stx,buffer2,crc_buf]);
        }

        public mavlinkPackCtrlMotor(output1:number,output2:number,srcSystem?:number, srcComponent?:number) : Buffer{
            let stx = pins.createBuffer(1)
            stx[0] = MAVLINK_STX;
            let buffer2 = pins.createBuffer(7)
            buffer2[0] = 0x02;
            buffer2[1] = this.seq;
            buffer2[2] = ( typeof srcSystem === 'undefined' ) ? 1 : srcSystem;
            buffer2[3] = ( typeof srcComponent === 'undefined' ) ? 1 : srcComponent;
            buffer2[4] = MAVLINK_MSG_ID_CTRL_MOTOR;//msg id
            buffer2[5] = output1;//
            buffer2[6] = output2;//
            let checksum = this.calculateChecksum(buffer2);
            let crc_extrabuf = pins.createBuffer(1)
            crc_extrabuf[0] = 97;
            checksum = this.calculateChecksum(crc_extrabuf,checksum);
            let crc_buf = pins.createBuffer(2)
        
            crc_buf[0] = checksum&0xff;
            crc_buf[1] = checksum>>8;
            this.seq = (this.seq + 1) % 256;
        
            return Buffer.concat([stx,buffer2,crc_buf]);
        }

    }
}
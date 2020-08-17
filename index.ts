type lame_t = number;
type lame_ptr = number;
type LameCall = 0 | -1 | -2 | -3;

const enum MPEG_mode {

    STEREO = 0, JOINT_STEREO, DUAL_CHANNEL, MONO, NOT_SET, MAX_INDICATOR

}

const enum vbr_mode {

    vbr_off = 0, vbr_mt, vbr_rh, vbr_abr, vbr_mtrh, vbr_max_indicator, vbr_default = 4

}

declare interface Module {
    readonly HEAP8: Int8Array;
    readonly HEAP16: Int16Array;
    readonly HEAP32: Int32Array;
    readonly HEAPU8: Uint8Array;
    readonly HEAPU16: Uint16Array;
    readonly HEAPU32: Uint32Array;
    readonly HEAPF32: Float32Array;
    readonly HEAPF64: Float64Array;

    _malloc(__size: number): number;

    _calloc(__nmemb: number, __size: number): number;

    _free(__ptr: number): void;
}

declare interface Lame extends Module {

    _lame_init(): lame_t;

    _lame_init_params(gfp: lame_t): LameCall;

    _lame_close(gfp: lame_t): LameCall;

    _lame_set_mode(gfp: lame_t, mode: MPEG_mode): LameCall;

    _lame_set_num_channels(gfp: lame_t, num_channels: number): LameCall;

    _lame_set_in_samplerate(gfp: lame_t, in_samplerate: number): LameCall;

    _lame_set_VBR(gfp: lame_t, VBR: vbr_mode): LameCall;

    _lame_set_VBR_quality(gfp: lame_t, VBR_q: number): LameCall;

    _lame_encode_buffer_ieee_float(gfp: lame_t, pcm_l: lame_ptr, pcm_r: lame_ptr, nsamples: number, mp3buf: lame_ptr, mp3buf_size: number): LameCall | number;

    _lame_encode_flush(gfp: lame_t, mp3buffer: lame_ptr, mp3buffer_size: number): LameCall | number;

}

const MAX_SAMPLES = 65536;
const PCM_BUF_SIZE = MAX_SAMPLES * 4;
const BUF_SIZE = (MAX_SAMPLES * 1.25 + 7200);

const lame: Lame = require('./dist/dlame.js') as Lame;

namespace Lame {

    export class Encoder {

        private readonly lame_t: lame_t;

        private readonly buffer: Uint8Array;
        private readonly pcm_buffers: Float32Array[];

        public constructor(sample_rate: number, quality: number) {
            this.lame_t = lame._lame_init();
            this.buffer = new Uint8Array(lame.HEAP8.buffer, lame._malloc(BUF_SIZE));
            this.pcm_buffers = [
                new Float32Array(lame.HEAP8.buffer, lame._malloc(PCM_BUF_SIZE)),
                new Float32Array(lame.HEAP8.buffer, lame._malloc(PCM_BUF_SIZE))
            ];

            lame._lame_set_mode(this.lame_t, MPEG_mode.STEREO);
            lame._lame_set_num_channels(this.lame_t, 2);

            lame._lame_set_in_samplerate(this.lame_t, sample_rate);
            lame._lame_set_VBR(this.lame_t, vbr_mode.vbr_default);
            lame._lame_set_VBR_quality(this.lame_t, quality);

            if (lame._lame_init_params(this.lame_t) < 0) {
                throw new Error('Unable to initialize LAME encoder!');
            }
        }

        public *encode(...data: Float32Array[]): Iterable<Uint8Array> {
            const samples = data[0].length;

            for (let start = 0; start < samples;) {
                const size = Math.min(start + MAX_SAMPLES, samples);

                for (const [i, buffer] of data.entries()) {
                    const chunk = buffer.slice(start, size);
                    this.pcm_buffers[i].set(chunk);
                }

                const _encoded = lame._lame_encode_buffer_ieee_float(
                    this.lame_t,
                    this.pcm_buffers[0].byteOffset,
                    this.pcm_buffers[1].byteOffset,
                    size - start,
                    this.buffer.byteOffset,
                    BUF_SIZE
                );

                start = size;
                yield this.buffer.slice(0, _encoded);
            }
        }

        public flush(): Uint8Array {
            const _encoded = lame._lame_encode_flush(
                this.lame_t,
                this.buffer.byteOffset,
                BUF_SIZE
            );

            return this.buffer.slice(0, _encoded);
        }

        public close(): void {
            lame._free(this.lame_t);
        }

    }

}

export default Lame;
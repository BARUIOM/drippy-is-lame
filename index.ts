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

    _lame_encode_buffer_ieee_float(gfp: lame_t, pcm_l: lame_ptr, pcm_r: lame_ptr, nsamples: number, mp3buf: lame_ptr, mp3buf_size: number): LameCall;

    _lame_encode_flush(gfp: lame_t, mp3buffer: lame_ptr, mp3buffer_size: number): LameCall | number;

}

const MAX_SAMPLES = 65536;
const PCM_BUF_SIZE = MAX_SAMPLES * 4;
const BUF_SIZE = (MAX_SAMPLES * 1.25 + 7200);

const lame: Lame = require('./dist/dlame.js') as Lame;

namespace Lame {

}

export default Lame;
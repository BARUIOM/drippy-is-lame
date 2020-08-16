LAME_DIR=$(CURDIR)/lame-3.100
LAME_SRC=https://ufpr.dl.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz

DIST_DIR=$(LAME_DIR)/dist
LAME_LIB=$(DIST_DIR)/lib/libmp3lame.so
LAME_MAKE=$(LAME_DIR)/Makefile

default: dist/dlame.wasm

dist/dlame.wasm: $(LAME_LIB)
	emcc $^ -Oz -Os \
		-s WASM=1 -s MODULARIZE=1 -s NODEJS_CATCH_EXIT=0 \
		-s EXPORTED_FUNCTIONS="['_malloc', '_calloc', '_free', '_lame_init', '_lame_init_params', '_lame_close', '_lame_set_mode', '_lame_set_num_channels', '_lame_set_in_samplerate', '_lame_set_VBR', '_lame_set_VBR_quality', '_lame_encode_buffer_ieee_float', '_lame_encode_flush']" \
		-o dist/dlame.js

$(LAME_LIB): $(LAME_MAKE)
	cd $(LAME_DIR) && \
	emmake make -j8 && \
	emmake make install

$(LAME_MAKE): sources
	cd $(LAME_DIR) && \
	emconfigure ./configure CFLAGS="-Oz" \
		--prefix="$(DIST_DIR)" --host=x86-none-linux \
		--disable-static \
		--disable-gtktest \
		--disable-analyzer-hooks \
		--disable-frontend

sources:
	@mkdir -p dist
	@if [ ! -d "$(LAME_DIR)" ]; then \
		wget -N "$(LAME_SRC)" && \
		tar -xvf lame-3.100.tar.gz && \
		rm -f lame-3.100.tar.gz; \
    fi

clean:
	@rm -rf dist/
	@rm -rf $(LAME_DIR)

.PHONY: clean sources
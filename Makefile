LAME_VERSION=3.100

LAME_DIR=$(CURDIR)/lame-$(LAME_VERSION)
LAME_SRC=https://ufpr.dl.sourceforge.net/project/lame/lame/$(LAME_VERSION)/lame-$(LAME_VERSION).tar.gz

DIST_DIR=$(LAME_DIR)/dist
LAME_LIB=$(DIST_DIR)/lib/libmp3lame.so

default: dist/dlame.js

dist/dlame.js: $(LAME_LIB)
	@mkdir -p dist
	emcc $^ -Oz -Os \
		-s MODULARIZE=1 -s NODEJS_CATCH_EXIT=0 \
		-s EXPORTED_FUNCTIONS="[ \
			'_malloc', \
			'_free', \
			'_lame_init', \
			'_lame_init_params', \
			'_lame_close', \
			'_lame_set_mode', \
			'_lame_set_num_channels', \
			'_lame_set_in_samplerate', \
			'_lame_set_VBR', \
			'_lame_set_VBR_quality', \
			'_lame_encode_buffer_ieee_float', \
			'_lame_encode_flush', \
			'_hip_decode_init', \
			'_hip_decode_exit', \
			'_hip_decode1', \
			'_hip_decode1_headers'\
		]" -o $@

$(LAME_LIB): lame-$(LAME_VERSION)/configure
	emmake $(MAKE) -j8 -C $(LAME_DIR)
	emmake $(MAKE) -C $(LAME_DIR) install

lame-$(LAME_VERSION)/configure:
	@if [ ! -d "$(LAME_DIR)" ]; then \
		(wget -N "$(LAME_SRC)" && tar -xvf lame-$(LAME_VERSION).tar.gz && rm -f lame-$(LAME_VERSION).tar.gz); \
	fi
	
	cd $(LAME_DIR) && \
	emconfigure ./configure CFLAGS="-Oz" \
		--prefix="$(DIST_DIR)" --host=x86-none-linux \
		--disable-static \
		--disable-gtktest \
		--disable-analyzer-hooks \
		--disable-frontend

clean:
	$(MAKE) -C $(LAME_DIR) clean
	rm -rf $(DIST_DIR) dist

.PHONY: clean
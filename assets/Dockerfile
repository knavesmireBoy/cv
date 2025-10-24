FROM php:8.4-apache

WORKDIR /var/www/html
#WORKDIR /

RUN docker-php-ext-install pdo pdo_mysql

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && a2enmod rewrite

RUN apt-get update && apt-get install -y \
                libfreetype-dev \
                libjpeg62-turbo-dev \
                libpng-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
        && docker-php-ext-install -j$(nproc) gd \
        && docker-php-ext-enable gd


RUN apt-get update && apt-get upgrade -y


RUN sed -i '/#!\/bin\/sh/aecho "$(hostname -i)\t$(hostname) $(hostname).localhost" >> /etc/hosts' /usr/local/bin/docker-php-entrypoint

#RUN sed -i "s/post_max_size =.*/post_max_size = 200M/g" /etc/php5/fpm/php.ini
#RUN sed -i "s/upload_max_filesize =.*/upload_max_filesize = 200M/g" /etc/php5/fpm/php.ini

RUN echo "post_max_size=20M" > /usr/local/etc/php/conf.d/php-uploadsize.ini
RUN echo "upload_max_filesize=20M" >> /usr/local/etc/php/conf.d/php-uploadsize.ini
#below optional MAKE SURE the below line is in server block of nginx.conf
#client_max_body_size 200M;
RUN echo "client_max_body_size=20M" >> /usr/local/etc/php/conf.d/php-uploadsize.ini
RUN echo "memory_limit=20M" >> /usr/local/etc/php/conf.d/php-uploadsize.ini
#RUN echo "ServerName localhost:80" >> /etc/apache2/apache2.conf

#USER appuser
HEALTHCHECK CMD curl --fail http://localhost/index.php || exit 1

COPY ./etc/001-default.conf /etc/apache2/sites-enabled/000-default.conf
#COPY ./path/to/uploads.ini /usr/local/etc/php/conf.d/
COPY ./app /var/www
COPY ./public /var/www/html
